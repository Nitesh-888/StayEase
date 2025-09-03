let sec = Math.floor(time / 1000); 
console.log(sec);
let countDown = setInterval(()=>{
    let timer=document.getElementById('timer');
    timer.innerText=`(${sec})`;
    sec--;
    if(sec<0){
        clearInterval(countDown);
        timer.innerText='';
    }
}, 1000);