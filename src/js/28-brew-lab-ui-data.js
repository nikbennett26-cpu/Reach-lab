/* ---------- INK BENCH: build a custom ink from ingredient types, mapped onto the app's ink physics ---------- */
const MX={base:'alcohol',pot:65,bind:25,thin:35,pigs:new Set(['nig']),add:new Set(),amt:{}};
const PIGS={
 nig:{n:'Jet black dye',c:'#121216',k:'dye',s:.85,ts:7.5,d:'See-through black dye. Goes jet black and stains hard.'},
 gv:{n:'Deep violet dye',c:'#4b1498',k:'dye',s:.95,ts:7.0,g:'#6b58c9',d:'The strongest stain there is. Soaks into plastic and leaves a purple ghost.'},
 rhod:{n:'Hot pink dye',c:'#d41472',k:'dye',s:.9,ts:5.5,d:'Bright see-through pink. Stains hard.'},
 sred:{n:'Red dye',c:'#c21818',k:'dye',s:.85,ts:4.5,d:'See-through crimson. The classic red marker colour.'},
 pblu:{n:'Blue dye',c:'#163aa8',k:'dye',s:.62,ts:6.5,d:'See-through blue. Mix with yellow for green. Medium stain.'},
 syel:{n:'Yellow dye',c:'#eab808',k:'dye',s:.5,ts:1.6,d:'See-through golden yellow. Add blue for green or red for orange.'},
 tio2:{n:'White',c:'#f4f3ee',k:'paint',s:.05,ts:1.0,d:'Solid white. Makes paint cover, and lightens colours to pastels.'},
 cblk:{n:'Black',c:'#111111',k:'paint',s:.25,ts:8.5,d:'Solid black. Very strong, a little goes a long way.'},
 iron:{n:'Brick red',c:'#9e2c20',k:'paint',s:.15,ts:3.0,d:'Solid rusty brick red.'},
 pgrn:{n:'Emerald green',c:'#187538',k:'paint',s:.3,ts:6.0,d:'Solid deep emerald green.'},
 hansa:{n:'Yellow',c:'#f2c80f',k:'paint',s:.1,ts:1.8,d:'Solid bright yellow. Add blue for a solid green.'},
 alu:{n:'Silver flake',c:'#bcc2c8',k:'metal',s:.05,ts:1.2,d:'Mirror chrome flake. Shake it well.'},
 bronze:{n:'Gold flake',c:'#c28538',k:'metal',s:.05,ts:1.3,d:'Gold-bronze metal flake.'},
 pruss:{n:'Prussian blue',c:'#0d265c',k:'dye',s:.2,ts:7.2,d:'Inky dark blue. Darkens a mix a lot but hardly stains on its own.'},
 malg:{n:'Green dye',c:'#0d6e4e',k:'dye',s:.92,ts:6.8,d:'Teal-green. Stains very hard and leaves a green ghost.'},
 indg:{n:'Indigo dye',c:'#1c1866',k:'dye',s:.55,ts:6.5,d:'Deep blue-purple. Stains best in a water mix, weaker in alcohol.'},
 ochre:{n:'Ochre',c:'#c48e2a',k:'paint',s:.15,ts:2.4,d:'Solid earthy mustard gold.'},
 ultrab:{n:'Ultramarine',c:'#1b34b0',k:'paint',s:.2,ts:3.2,d:'Solid rich blue.'},
 cadred:{n:'Scarlet',c:'#dc2618',k:'paint',s:.15,ts:3.8,d:'Solid punchy red.'},
 umbe:{n:'Earth brown',c:'#4a3420',k:'paint',s:.25,ts:3.5,d:'Solid dark brown.'},
 graphite:{n:'Graphite',c:'#2e3136',k:'metal',s:.2,ts:2.2,d:'Dark gunmetal shimmer.'},
 bism:{n:'Brown dye',c:'#5c2810',k:'dye',s:.88,ts:6.2,g:'#8f4a1c',d:'Deep tobacco brown. Leaves a warm rusty ghost.'},
 sorng:{n:'Orange dye',c:'#e85a0c',k:'dye',s:.78,ts:4.8,d:'See-through bright orange, cleaner than mixing red and yellow.'},
 fluor:{n:'Neon green dye',c:'#9ef01a',k:'dye',s:.35,ts:3.6,g:'#76c814',d:'Neon yellow-green. Bleeds on wet walls but barely stains plastic.'},
 qmag:{n:'Magenta',c:'#c91c6e',k:'paint',s:.28,ts:5.2,d:'Solid hot pink. Good for pinks, purples and pastels.'},
 diox:{n:'Purple',c:'#36146b',k:'paint',s:.32,ts:7.4,d:'Solid deep purple. Very strong.'},
 crox:{n:'Olive green',c:'#4a6440',k:'paint',s:.15,ts:3.4,d:'Solid flat army olive.'},
 dayglo:{n:'Neon orange',c:'#ff5a14',k:'paint',s:.12,ts:2.8,d:'Chalky neon orange, like site paint.'},
 pearl:{n:'Pearl flake',c:'#e4e8f0',k:'metal',s:.05,ts:.45,d:'Pearly shimmer that shifts as you tilt. Doesn’t dull the colour.'}
};
const ADD={hum:'Glycerin: the nib stays wet with the cap off and dries much slower.',surf:'Flow agent: juicier flow that spreads more. Too much and it floods.',ret:'Retarder: stays wet longer, so more drips on shiny walls.',vio:'Violet booster: bites in hard, dries violet and ghosts back strongly.',oil:'Oil stain: leaves a greasy stain that comes back after buffing.',dot3:'Brake fluid: stays wet and eats through paint and plastic. Very hard to buff.',meth:'Blue booster: very strong blue stain that bleeds back through a buff.',bitu:'Tar: thick and dark. Leaves a stubborn brown-black stain.',pen:'Penetrant: drives the ink deep into the wall, so buffing only smears the top.',shift:'Colour shift: the whole tag flips blue-violet when you tilt.',xylene:'Xylene: softens plastic and painted walls. Bleeds deep and ghosts hard.',fecl:'Rust etch: eats into painted walls and leaves a permanent rusty ghost.',acid:'Acid bite: bites into plastic and glass and leaves a dull ghost that won’t buff.',mek:'Acetone: melts into plastic and dries fast, leaving bitten edges.',silic:'Silicone: super slippery. Rags just smear it, and paint won’t cover it.',rosin:'Rosin: sticky and glossy. Slow thick drips that skin over.',uv:'UV brightener: louder colour that pops on dark walls.',fish:'Penetrol: slower drying, smooth glassy finish, harder to buff.',garvey:'Garvey ink: thin, bleeds violet-pink and is very hard to buff.',silica:'Gel thickener: holds a raised line that doesn’t drip, but still flows when you move fast.',wax:'Beeswax: dries matte, cuts drips, and makes rags skip.',methl:'Methanol: thins it right down. Fast skinny drips that dry halfway down, and streaky lines.',agno3:'Silver darkener: goes on pale and slowly turns a permanent brown-black.',etch:'Glass etch: frosts glass for good and can’t be buffed. Does nothing to plastic.'};
