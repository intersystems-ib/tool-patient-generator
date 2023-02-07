
module.exports = {
    parseDate: function(date, type, points) {
        var yyyy = date.getFullYear().toString();
        var MM = (date.getMonth() + 1).toString().padStart(2,'0');
        var dd = date.getDate().toString().padStart(2,'0');
        var hh = date.getHours().toString().padStart(2,'0');
        var mm = date.getMinutes().toString().padStart(2,'0');
        var ss = date.getSeconds().toString().padStart(2,'0');

        if (type === 'date')
        {
            if (points)
            {
                return yyyy+'.'+MM+'.'+dd;
            }
            else 
            {
                return yyyy+MM+dd;
            }
        }
        else if (type === 'time')
        {
            return hh + ':' + mm + ':' + ss + '.000'
        }
        else 
        {
            return yyyy+MM+dd+hh+mm+ss;
        }
    },

    generateDNI: function(dni) {
        const cadena="TRWAGMYFPDXBNJZSQVHLCKET";
        var posicion = dni%23;
        var letra = cadena.substring(posicion,posicion+1);
        return dni+letra;
    },

    generateId: function(length) {
        var result           = '';
        var characters       = '0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
