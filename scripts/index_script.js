const getHandle = () => {

const handle = document.getElementById('input-handle').value;
console.log(handle);

window.location.href = "./routes/home.html?handle="+handle;


}

window.addEventListener('keydown', 
function(event) {
    if(event.key =="Enter") {
        event.preventDefault();
        getHandle();
        console.log("Enter");
    }
}
);