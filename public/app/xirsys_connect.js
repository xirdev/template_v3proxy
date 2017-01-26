// 'ident' and 'secret' should ideally be passed server-side for security purposes.
// If secureTokenRetrieval is true then you should remove these two values.

// Insecure method
// var xirsysConnect = {
//     secureTokenRetrieval: false,
//     data: {
//         domain: 'www.jertest1.com', //'myroom',//
//         application: 'testing',
//         room: 'default',
//         ident: 'jerzilla',
//         secret: '06727832-b20f-4cc0-a954-5bed3310033d', //'1d484d60-6af4-11e6-b627-ba45bfd7b2b0',//
//         secure: 1
//     }
// };

// Secure method
var xirsysConnect = {
    secureTokenRetrieval: true,
    server: '',
    data: {
        domain: 'my',
        application: 'default',
        room: 'default',
        secure: 0
    }
};