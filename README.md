# CSS Charger - A SuperCharger for CSS #

This tool embeds images in Stylesheets as Base64 data-uris. 

Supports all typical kinds of images and SVG as well.

Developed for NodeJS.

## Basic Usage ##

Run with

    node csscharger.js <inputfile> <outputfile>


## MHTML ##

Just enter the URL of the Stylesheet as `--mhtml` option to enable MHTML mode

    node csscharger.js --mhtml http://mydomain.com/css basic.css basic-mhtml.css

So the generated Stylesheet has to be reachable at `http://mydomain.com/css/basic-mhtml.css`


## Maximum size of embedded Files ##

IE8 has a maximum file size limit of 32KB for an embedded image. So files above 32kb won't be embedded. To overwrite or lowering this limit you can set the `--maxfilesize` option

    node csscharger.js --maxfilesize 10 <inputfile> <outputfile>

## Charset ##

If your Stylesheet is not encoded in UTF8, you can use the `--charset` to define it.

    node csscharger.js --charset MacRoman <inputfile> <outputfile>



## Help ##

Find more help with option `-h`

    node csscharger.js -h


## Copyright and License ##

See `LICENSE` file

Copyright © 2011 Helge Grimm. All rights reserved.

(Inspired by nzakas' [CSSEmbed](https://github.com/nzakas/cssembed))