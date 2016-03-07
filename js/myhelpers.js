/*
 helpers
*/
var h = {
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getNegOrPos : function() {
        // returns -1 and 1 in sequence
        var n, 
            b = false;

        if (!b) {
            n = -1;
            b = true;
        } else {
            n = 1;
            b = false;
        }
        return n;
        // randomly return -1 and 1
        // var n = ((Math.random() > 0.5) ? -1 : 1);
        // return n;
    },
    onError: function(error) {
        console.log('error:');
        console.log(error);
    }
};