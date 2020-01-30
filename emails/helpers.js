const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path')
const fa = require('font-awesome-assets');
const Handlebars = require('handlebars')
const axios = require('axios')


let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'samjust2ok@gmail.com',
        pass:'samflex...'
    }
});

const email = new Email({
    message:{
        from: 'samjust2ok@gmail.com'
    },
    send:true,
    preview: false,
    transport:transporter,
    views:{
        options:{
            extension: 'hbs'
        }
    }
})

Handlebars.registerHelper('fa',function(iconName,className){
    let ss = fa.svg(iconName, '#fff', 30, 30, [
        [ 'class', className],
      ]);
    return new Handlebars.SafeString(ss)
})



exports.sendEmail = (mailCustomizers)=>{
 return email.send({
        template: path.join(__dirname,'templates',mailCustomizers.template),
        message:{
            to: mailCustomizers.to,
        },
        locals:{
            ...mailCustomizers.templateData,
            dir:process.cwd()+'/assets',
        }
    })
}