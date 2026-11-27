/* ---------- INK BENCH: build a custom ink from ingredient types, mapped onto the app's ink physics ---------- */
const MX={base:'alcohol',pot:65,bind:25,thin:35,pigs:new Set(['nig']),add:new Set(),amt:{}};
const PIGS={
 nig:{n:'Jet black dye',c:'#121216',k:'dye',s:.85,ts:7.5,d:'Alcohol-soluble black dye — deep jet black, strong stain.'},
 gv:{n:'Deep violet dye',c:'#4b1498',k:'dye',s:.95,ts:7.0,g:'#6b58c9',d:'Extreme staining violet dye — bites into plastic & ghosts purple.'},
 rhod:{n:'Hot pink dye',c:'#d41472',k:'dye',s:.9,ts:5.5,d:'Fluorescent magenta-red dye — intense pink/crimson, stains hard.'},
 sred:{n:'Red dye',c:'#c21818',k:'dye',s:.85,ts:4.5,d:'Rich translucent crimson dye — classic red marker ink.'},
 pblu:{n:'Blue dye',c:'#163aa8',k:'dye',s:.62,ts:6.5,d:'Solvent-soluble phthalocyanine blue dye — mix with yellow for green; moderate stain.'},
 syel:{n:'Yellow dye',c:'#eab808',k:'dye',s:.5,ts:1.6,d:'Bright golden dye — mix with blue for green, or red for orange.'},
 tio2:{n:'White',c:'#f4f3ee',k:'paint',s:.05,ts:1.0,d:'Opaque mineral white pigment — makes opaque paints, greys & pastels.'},
 cblk:{n:'Black',c:'#111111',k:'paint',s:.25,ts:8.5,d:'Opaque jet-black pigment — high tinting strength; a little goes far.'},
 iron:{n:'Brick red',c:'#9e2c20',k:'paint',s:.15,ts:3.0,d:'Earthy opaque rust/brick red mineral pigment.'},
 pgrn:{n:'Emerald green',c:'#187538',k:'paint',s:.3,ts:6.0,d:'Rich opaque emerald-forest green pigment.'},
 hansa:{n:'Yellow',c:'#f2c80f',k:'paint',s:.1,ts:1.8,d:'Bright opaque yellow pigment — mix with blue for opaque green.'},
 alu:{n:'Silver flake',c:'#bcc2c8',k:'metal',s:.05,ts:1.2,d:'Mirror chrome metallic flake — shake well.'},
 bronze:{n:'Gold flake',c:'#c28538',k:'metal',s:.05,ts:1.3,d:'Metallic bronze-gold flake pigment.'},
 pruss:{n:'Prussian blue',c:'#0d265c',k:'dye',s:.2,ts:7.2,d:'Deep inky iron-blue — really a transparent insoluble pigment: darkens brews a lot but barely stains on its own.'},
 malg:{n:'Green dye',c:'#0d6e4e',k:'dye',s:.92,ts:6.8,d:'Intense emerald-teal basic dye — extreme stain, ghosts green.'},
 indg:{n:'Indigo dye',c:'#1c1866',k:'dye',s:.55,ts:6.5,d:'Aniline (acid) blue dye — dissolves best in water, weaker in alcohol; deep blue-purple undertone.'},
 ochre:{n:'Ochre',c:'#c48e2a',k:'paint',s:.15,ts:2.4,d:'Earthy opaque mineral gold/mustard pigment.'},
 ultrab:{n:'Ultramarine',c:'#1b34b0',k:'paint',s:.2,ts:3.2,d:'Rich opaque mineral cobalt-blue paint pigment.'},
 cadred:{n:'Scarlet',c:'#dc2618',k:'paint',s:.15,ts:3.8,d:'Punchy opaque scarlet-red mineral paint pigment.'},
 umbe:{n:'Earth brown',c:'#4a3420',k:'paint',s:.25,ts:3.5,d:'Dark earthy brown mineral pigment.'},
 graphite:{n:'Graphite',c:'#2e3136',k:'metal',s:.2,ts:2.2,d:'Slick gunmetal metallic flake pigment.'},
 bism:{n:'Brown dye',c:'#5c2810',k:'dye',s:.88,ts:6.2,g:'#8f4a1c',d:'Classic aniline leather/wood dye — deep tobacco-mahogany, ghosts warm amber-rust.'},
 sorng:{n:'Orange dye',c:'#e85a0c',k:'dye',s:.78,ts:4.8,d:'Punchy translucent safety-orange dye — cleaner and brighter than mixing red + yellow.'},
 fluor:{n:'Neon green dye',c:'#9ef01a',k:'dye',s:.35,ts:3.6,g:'#76c814',d:'Water-soluble acid neon dye — vivid and weeps chartreuse on wet walls, but only stains plastic weakly.'},
 qmag:{n:'Magenta',c:'#c91c6e',k:'paint',s:.28,ts:5.2,d:'Punchy opaque hot-pink/magenta paint pigment — unlocks opaque pinks, purples & pastels.'},
 diox:{n:'Purple',c:'#36146b',k:'paint',s:.32,ts:7.4,d:'Deep, high-tinting opaque violet paint pigment.'},
 crox:{n:'Olive green',c:'#4a6440',k:'paint',s:.15,ts:3.4,d:'Flat, heavy industrial olive-drab mineral paint pigment.'},
 dayglo:{n:'Neon orange',c:'#ff5a14',k:'paint',s:.12,ts:2.8,d:'Bright, chalky fluorescent construction-orange opaque paint pigment.'},
 pearl:{n:'Pearl flake',c:'#e4e8f0',k:'metal',s:.05,ts:.45,d:'Translucent satin-iridescent flake — adds metallic tilt shimmer to any colour without greying it out.'}
};
const ADD={hum:'Glycerin: nib stays wet uncapped, dries out far slower.',surf:'Flow agent: juicier flow and more spread — overdo it and it floods.',ret:'Retarder: stays wet longer, so more runs on non-porous walls.',vio:'Violet booster: bites in hard, dries violet, ghosts strongly.',oil:'Oil stain: leaves a greasy stain that ghosts back after buffing.',dot3:'Brake fluid: stays wet longer and bites straight through paint & plastic — heavy buff-proof ghosting.',meth:'Blue booster: ultra-concentrated deep dye that stains permanently and bleeds back through buff coats.',bitu:'Tar: heavy oil-soluble dark stain that thickens the mix and burns a stubborn brown-black ghost.',pen:'Penetrant: drives dye deep into plastic, paint and stone so buffing only smears the surface.',shift:'Colour shift: the whole tag swings blue-violet when you tilt.',xylene:'Xylene: softens plastic & painted walls, drives deep bleed and stubborn buff ghosting.',fecl:'Rust etch: acidic rust-brown bite that eats into painted surfaces and leaves a permanent amber-brown ghost.',acid:'Acid bite: bites into smooth plastic & glass with a permanent matte ghost that resists buffing.',mek:'Acetone: melts straight into plastic & PVC, flashes dry fast with tight permanent edge-bite.',silic:'Silicone: extreme anti-buff slip — makes rags smear wildly and resists overpainting.',rosin:'Rosin: heavy sticky tackifier — syrupy slow drips, high-gloss clearcoat, skins over mid-cure.',uv:'UV brightener: punches up chroma and makes the dried tag pop louder on dark walls.',fish:'Penetrol: slows drying, drops surface tension for glassy levelling, and boosts buff resistance.',garvey:'Garvey ink: low-viscosity pricing-gun ink base — aggressive violet-magenta bleed and heavy buff-proof ghosting.',silica:'Gel thickener: holds a proud, drip-free line at rest while shearing smooth under fast nib movement.',wax:'Beeswax: dries matte and hydrophobic — cuts drips, kills wet gloss, and makes buff rags skip.',methl:'Methanol: ultralight solvent thinner — fast skinny runs that flash-dry halfway down the wall.',agno3:'Silver darkener: goes down pale and gradually darkens over several seconds into a permanent brownish-black stain.',etch:'Glass etch: turns the mix into an etch — frosts glass for good and can’t be buffed. Does nothing to plastic.'};
