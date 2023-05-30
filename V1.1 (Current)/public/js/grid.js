const drawGrid = () => {
    var cnv = document.getElementById("cnv");
    cnv.width = window.innerWidth * 3;
    cnv.height = window.innerHeight * 3;


    // Controls line characteristics
    window.cellsize = 30;
    const lineOptions = {
        separation: window.cellsize,
        colour: getComputedStyle(document.querySelector(':root')).getPropertyValue("--lineColour")
    }

    let iWidth = cnv.width;
    let iHeight = cnv.height;

    let ctx = cnv.getContext('2d');

    ctx.strokeStyle = lineOptions.colour;
    ctx.lineWidth = 1;
    
    ctx.beginPath();

    let iCount = null;
    let i = null;
    let x = null;
    let y = null;

    iCount = Math.floor(iWidth / lineOptions.separation);

    for (i = 1; i <= iCount; i++) {
        x = (i * lineOptions.separation);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, iHeight);
        ctx.stroke();
    }


    iCount = Math.floor(iHeight / lineOptions.separation);

    for (i = 1; i <= iCount; i++) {
        y = (i * lineOptions.separation);
        ctx.moveTo(0, y);
        ctx.lineTo(iWidth, y);
        ctx.stroke();
    }

    ctx.closePath();

    return;
}
