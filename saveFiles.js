var 
files = require( './map-links.json' ),
fs = require( 'fs' ),
request = require( 'request' ),
async = require( 'async' ),
fileNames = Object.keys( files ),
paths = fileNames.map( parseUrl ),
fileDownloads = fileNames.map( downloadFilesFns ),
mkdirs = paths.map( mkdirFns )

function mkdirFns( dir ) {
    return mkDir.bind( null, dir )
}

function downloadFilesFns( dir ) {
    return function( callback ) {
        var 
        _files = files[ dir ],
        fns = _files.map( fileDownloadFns.bind( null, dir ) )
        async.series( fns, callback );
    }
}

function fileDownloadFns( dir, file ) {
    var 
    fileName = file.split( '/' ).pop(),
    path = parseUrl( dir )

    return function( callback ) {

        console.log( 'Downloading ' + file );

        var 
        _file = __dirname + '/images/' + path + '/' + fileName,
        exists = fs.exists( _file ),
        ws

        if ( !exists ) {

            ws = fs.createWriteStream( _file )

            request( file )
                .on( 'response', function( err ){
                    console.log( 'done with ' + _file )
                    callback();
                })
                .on( 'error', function( err ){
                    callback( 'error', err )
                })
                .pipe( ws )
        
        }
        else {
            callback( );
        }
    }
}

function mkDir( dir, callback ) {
    fs.mkdir( __dirname + '/images/' + dir, callback )
}

function parseUrl( url ) {
    return url.split( '/' ).pop()
}

// fs.mkdir( __dirname + '/images', function() {
//     async.series( mkdirs, function( err ) {
//         if ( err ) return console.log( err )
        async.series( fileDownloads, function( err ) {
            if ( err ) return console.log( err )
            console.log( 'done' )
        })
//     })
// } );
