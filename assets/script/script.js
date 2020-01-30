const verify = document.querySelector('.verify');

verify.addEventListener('click',function(evt){
    axios.request({
        method:'PATCH',
        url:'http://localhost:3001/users/verify/'+ evt.target.dataset.id,
    })
})