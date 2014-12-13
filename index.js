var 
request = require('request'),
$ = require('cheerio'),
async = require('async'),
fs = require('fs'),
url = 'http://www.mars.asu.edu/data/',
photoUrls = {}

function makeArray ( arr ) {
    return Array.prototype.slice.call( arr, 0 );
}

function getLinks ( _url, callback ) {
    request( _url, function( err, req, body ){
        if ( err ) return callback( err )

        var
        $body = $( body ),
        $links = $body.find( 'table.main td.c a' )

        function hyperlinks( ) {
            return !/:\/\//.test( this.attribs.href ) 
        }

        function buildLinks( ) {
            return this.attribs.href
        }

        callback( null, makeArray( $links.filter( hyperlinks ).map( buildLinks ) ) );
    })
}

function getPhotoLinks ( _url, callback ) {
    request( _url, function( err, req, body ){
        if ( err ) return callback( err )

        var
        $body = $( body ),
        $links = $body.find( '.map td a' )

        function hyperlinks( ) {
            return !/:\/\//.test( this.attribs.href ) 
        }

        function buildLinks( ) {
            return _url + '/' + this.attribs.href
        }

        photoUrls[ _url ] = makeArray( $links.filter( hyperlinks ).map( buildLinks ) ) 
        callback()
    })
}

getLinks( url, function ( err, urls ) {
    if ( err ) return console.log( err )

    function buildLinks( path ) {
        return getPhotoLinks.bind( null, url + path );
    }

    var fns = urls.map( buildLinks )

    async.series( fns, function( err ){
        if ( err ) return console.log( err )
        fs.writeFile( './map-links.json', JSON.stringify( photoUrls, null, '\t' ), function( err ) {
            console.log( 'done' );
        } )
    })
} );