package com.rsm.reachlab;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.content.FileProvider;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * JS bridge exposed as window.AndroidBridge.
 * The page streams a Blob in base64 chunks: begin() -> append()* -> finish(share).
 * Save  -> Gallery (Movies/ReachLab, Pictures/ReachLab) or Downloads/ReachLab.
 * Share -> Android share sheet via FileProvider.
 * Result is reported back through window.__rlSaveDone(ok, message).
 */
public class SaveBridge {
    static final int REQ_WRITE = 4711;

    private static final class Job {
        final String name, mime; final File tmp; OutputStream out;
        Job(String name, String mime, File tmp, OutputStream out) { this.name = name; this.mime = mime; this.tmp = tmp; this.out = out; }
    }

    private final Activity act;
    private final WebView web;
    private final Map<String, Job> jobs = new HashMap<>();
    private Job pendingPermJob;

    public SaveBridge(Activity act, WebView web) { this.act = act; this.web = web; }

    @JavascriptInterface
    public synchronized String begin(String name, String mime) {
        try {
            File dir = new File(act.getCacheDir(), "rl_out");
            if (!dir.exists() && !dir.mkdirs()) return "";
            String id = UUID.randomUUID().toString();
            File tmp = new File(dir, id + ".part");
            jobs.put(id, new Job(safeName(name), cleanMime(mime, name), tmp, new FileOutputStream(tmp)));
            return id;
        } catch (Exception e) { return ""; }
    }

    @JavascriptInterface
    public synchronized boolean append(String id, String b64) {
        Job j = jobs.get(id);
        if (j == null || j.out == null) return false;
        try { j.out.write(Base64.decode(b64, Base64.DEFAULT)); return true; }
        catch (Exception e) { return false; }
    }

    @JavascriptInterface
    public synchronized void cancel(String id) {
        Job j = jobs.remove(id);
        if (j != null) { closeQuiet(j.out); j.tmp.delete(); }
    }

    @JavascriptInterface
    public synchronized void finish(String id, boolean share) {
        final Job j = jobs.remove(id);
        if (j == null) { done(false, "Nothing to save"); return; }
        closeQuiet(j.out); j.out = null;
        if (share) { new Thread(() -> doShare(j)).start(); return; }
        if (Build.VERSION.SDK_INT < 29 &&
                act.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            pendingPermJob = j;
            act.runOnUiThread(() -> act.requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_WRITE));
            return;
        }
        new Thread(() -> doSave(j)).start();
    }

    /** Called from MainActivity.onRequestPermissionsResult (Android 9 and older only). */
    void onPermissionResult(boolean granted) {
        final Job j;
        synchronized (this) { j = pendingPermJob; pendingPermJob = null; }
        if (j == null) return;
        if (!granted) { j.tmp.delete(); done(false, "Storage permission needed to save to phone"); return; }
        new Thread(() -> doSave(j)).start();
    }

    // ---------------------------------------------------------------- save
    private void doSave(Job j) {
        try {
            String where;
            if (Build.VERSION.SDK_INT >= 29) where = saveMediaStore(j);
            else where = saveLegacy(j);
            done(true, "Saved to " + where);
        } catch (Exception e) {
            done(false, "Couldn’t save — " + (e.getMessage() == null ? "storage error" : e.getMessage()));
        } finally { j.tmp.delete(); }
    }

    private String saveMediaStore(Job j) throws Exception {
        ContentResolver cr = act.getContentResolver();
        Uri coll; String rel;
        if (j.mime.startsWith("video/")) { coll = MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY); rel = Environment.DIRECTORY_MOVIES + "/ReachLab"; }
        else if (j.mime.startsWith("image/")) { coll = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY); rel = Environment.DIRECTORY_PICTURES + "/ReachLab"; }
        else { coll = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY); rel = Environment.DIRECTORY_DOWNLOADS + "/ReachLab"; }
        ContentValues v = new ContentValues();
        v.put(MediaStore.MediaColumns.DISPLAY_NAME, j.name);
        v.put(MediaStore.MediaColumns.MIME_TYPE, j.mime);
        v.put(MediaStore.MediaColumns.RELATIVE_PATH, rel);
        v.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri uri = cr.insert(coll, v);
        if (uri == null) throw new Exception("phone refused the file");
        try (OutputStream os = cr.openOutputStream(uri); InputStream is = new FileInputStream(j.tmp)) {
            if (os == null) throw new Exception("couldn’t open storage");
            copy(is, os);
        } catch (Exception e) { cr.delete(uri, null, null); throw e; }
        v.clear();
        v.put(MediaStore.MediaColumns.IS_PENDING, 0);
        cr.update(uri, v, null, null);
        return rel.replace("/", " › ");
    }

    private String saveLegacy(Job j) throws Exception {
        String type = j.mime.startsWith("video/") ? Environment.DIRECTORY_MOVIES
                : j.mime.startsWith("image/") ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS;
        File dir = new File(Environment.getExternalStoragePublicDirectory(type), "ReachLab");
        if (!dir.exists() && !dir.mkdirs()) throw new Exception("couldn’t create folder");
        File dst = unique(dir, j.name);
        try (InputStream is = new FileInputStream(j.tmp); OutputStream os = new FileOutputStream(dst)) { copy(is, os); }
        MediaScannerConnection.scanFile(act, new String[]{dst.getAbsolutePath()}, new String[]{j.mime}, null);
        return type + " › ReachLab";
    }

    // ---------------------------------------------------------------- share
    private void doShare(Job j) {
        try {
            File dir = new File(act.getCacheDir(), "rl_share");
            File[] old = dir.listFiles();
            if (old != null) for (File f : old) f.delete();
            if (!dir.exists() && !dir.mkdirs()) throw new Exception("cache error");
            File dst = new File(dir, j.name);
            if (!j.tmp.renameTo(dst)) {
                try (InputStream is = new FileInputStream(j.tmp); OutputStream os = new FileOutputStream(dst)) { copy(is, os); }
            }
            final Uri uri = FileProvider.getUriForFile(act, act.getPackageName() + ".files", dst);
            act.runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType(j.mime);
                send.putExtra(Intent.EXTRA_STREAM, uri);
                send.putExtra(Intent.EXTRA_TITLE, "Reach Lab");
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent chooser = Intent.createChooser(send, "Share via");
                chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                act.startActivity(chooser);
            });
            done(true, "");
        } catch (Exception e) {
            done(false, "Couldn’t open share sheet");
        } finally { j.tmp.delete(); }
    }

    // ---------------------------------------------------------------- utils
    private void done(boolean ok, String msg) {
        final String js = "window.__rlSaveDone&&window.__rlSaveDone(" + ok + "," + JSONObject.quote(msg) + ")";
        web.post(() -> web.evaluateJavascript(js, null));
    }

    private static String cleanMime(String mime, String name) {
        String m = mime == null ? "" : mime.split(";")[0].trim().toLowerCase();
        if (m.isEmpty() || m.equals("application/octet-stream")) {
            String n = name == null ? "" : name.toLowerCase();
            if (n.endsWith(".mp4")) return "video/mp4";
            if (n.endsWith(".webm")) return "video/webm";
            if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
            if (n.endsWith(".png")) return "image/png";
            return "application/octet-stream";
        }
        return m;
    }

    private static String safeName(String n) {
        String s = (n == null || n.trim().isEmpty()) ? "reachlab-file" : n.trim();
        return s.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private static File unique(File dir, String name) {
        File f = new File(dir, name);
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name, ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 1; f.exists(); i++) f = new File(dir, base + "-" + i + ext);
        return f;
    }

    private static void copy(InputStream is, OutputStream os) throws Exception {
        byte[] buf = new byte[64 * 1024]; int r;
        while ((r = is.read(buf)) > 0) os.write(buf, 0, r);
        os.flush();
    }

    private static void closeQuiet(OutputStream o) { try { if (o != null) o.close(); } catch (Exception ignored) {} }
}
