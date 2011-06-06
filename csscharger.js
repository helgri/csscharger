var sys = require('sys'),
    fs = require('fs'),
    argv = process.argv;

if (argv.length > 0 && argv.indexOf("-help") != -1 || argv.length < 4) {
  sys.puts([
    "\nUsage: node csscharger.js  <options> <input-file> <output-file>\n",
    "Options",
    "-help Show this help",
    "--root <root> Custom path to relative linked file.",
    "--mhtml <mhtml root> HTTP URL of the Stylehsheet on the webwerver",
    "--maxfilesize <maxfilesize in KB> Custom file size limit for embedded images (Default: 32KB)",
    "--charset <charset> Custom charset of input file (Default: UTF8)",
    "-verbose Enable Verbose mode (Default: false)",
    ""].join("\n"));
  process.exit(1);
}


var CSSCharger = function(argv) {
  var startTime = new Date(),
      chargeCounter = 0;

  var getCustomOption =  function(opt) {
        var test = argv.indexOf(opt);
        if(opt.match(/^--/))
          return (test != -1) ? argv[test+1] : undefined;
        else
          return (test != -1) ? true : false;
      };
  
  var conf = {
      inputFile: [__dirname, argv[argv.length-2]].join("/"),
      outputFile: [__dirname, argv[argv.length-1]].join("/"),
      basePath: getCustomOption("--root") || ([__dirname, argv[argv.length-2].substring(0,argv[argv.length-2].lastIndexOf("/"))].join("/")),
      maxfilesize: getCustomOption("--maxfilesize")*1024 || 32*1024, //32KB limit for IE8
      mhtml: getCustomOption("--mhtml") || false,
      charset: getCustomOption("--charset") || "UTF8",
      verbose: getCustomOption("-verbose") || false
  }
  
  if(conf.mhtml) {
    conf.mhtmlBoundary = "CSSCharger";
    var mhtmlImages = ["/*\nContent-Type: multipart/related; boundary=\""+conf.mhtmlBoundary+"\"\n"];
  }
  
  if(conf.verbose) {
    console.log("\n\x1b[1mUsing Root Path:",conf.basePath,"\x1b[0m");
    conf.inputFile && console.log("\x1b[1mUsing Input:",conf.inputFile,"\x1b[0m");
    conf.outputFile && console.log("\x1b[1mUsing Output:",conf.outputFile,"\x1b[0m");
    conf.basePath && console.log("\x1b[1mUsing basePath:",conf.basePath,"\x1b[0m");
    conf.maxfilesize && console.log("\x1b[1mUsing Maxfilesize:",conf.maxfilesize/1024+"KB","\x1b[0m");
    conf.mhtml && console.log("\x1b[1mUsing MHTML:",conf.mhtml,"\x1b[0m");
    conf.charset && console.log("\x1b[1mUsing Charset:",conf.charset,"\x1b[0m");
  }
  
  
  var getBase64ForFile = function(file) {
    //is already data uri or remote url? then skip it
    if(file.match(/^data:/) || file.match(/^https*:/)) return file;

    var encoding = "base64",
        suffix = file.substring(file.lastIndexOf(".")+1),
        suffix = (suffix == "svg") ? [suffix,"xml"].join("+") : suffix,
        path = [conf.basePath,file].join("/"),
        fsize = fs.statSync(path).size,
        imageName = file.substring(file.lastIndexOf("/")+1),
        cssFileName = conf.inputFile.substring(conf.inputFile.lastIndexOf("/") + 1);
  
   if(fsize <= conf.maxfilesize) {
      conf.verbose && console.log("Embedding File:", file, "(~"+Math.ceil(fsize/1024)+"KB)");
  
      var base64 = fs.readFileSync(path).toString(encoding);
      ++chargeCounter;
   
      if(conf.mhtml) {
        mhtmlImages.push(["--"+conf.mhtmlBoundary,
                          "Content-Location:"+imageName,
                          "Content-Transfer-Encoding:"+encoding,
                          "","",base64].join("\n")
                        );
        var ret = ["mhtml:",conf.mhtml,cssFileName,"!",imageName].join("");
      } else {
        //assuming that only images are linked via url()
        var ret = ["data:image/",suffix,";",encoding,",",base64].join("");
      }
      return ret;
    } else {
      console.log("\x1b[31mMax file size exceeded. Skipped embedding:\x1b[0m", file);
      
      //return the given url
      return file;
    }
  
  };
  
  
  var rawCSS = fs.readFileSync(conf.inputFile, conf.charset),
      chargedCSS = rawCSS.replace(/(url\("*)(.+?)("*\))/g, 
        function(str, p1, p2, p3, offset, s){
          return p1+(getBase64ForFile(p2))+p3;
  });
      
  if(conf.mhtml) {
    mhtmlImages.push("\n--"+conf.mhtmlBoundary+"--\n*/");
    chargedCSS = mhtmlImages.join("\n") + "\n" + chargedCSS;
  }
  
  
  fs.writeFileSync(conf.outputFile,chargedCSS, conf.charset);
  
  
  fs.stat(conf.outputFile, function(err, stats){
    console.log("\x1b[1mEmbedded",chargeCounter, "images");
    console.log("Charged CSS filesize:","~" + Math.ceil(stats.size/1024) + "KB");
    console.log("Processing time:",(diffTime = new Date() - startTime)/1000 +"s\x1b[0m\n");
  });
}

CSSCharger(argv);