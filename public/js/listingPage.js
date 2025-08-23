let taxSwitch = document.getElementById("switchCheckDefault");
taxSwitch.addEventListener('click', (event)=>{
    if(event.target.checked){
        let prices = document.getElementsByClassName("prices");
        for(let price of prices){
            let amount = parseInt(price.innerText.split("/")[0].replace("₹","").replaceAll(",",""));
            let newAmount = amount * 1.18;
            price.innerText = `₹${newAmount.toLocaleString('en-IN')}/night`;
        }
        let taxInfos = document.getElementsByClassName("tax-infos");
        console.log(taxInfos);
        for(let taxInfo of taxInfos){
            taxInfo.style.display = "inline";
        }
    }else{
        let prices = document.getElementsByClassName("prices");
        for(let price of prices){
            let amount = parseInt(price.innerText.split("/")[0].replace("₹","").replaceAll(",",""));
            let newAmount = amount/(1+0.18);
            price.innerText = `₹${newAmount.toLocaleString('en-IN')}/night`;
        }
        let taxInfos = document.getElementsByClassName("tax-infos");
        for(let taxInfo of taxInfos){
            taxInfo.style.display = "none";
        }
    }
});