
// Method that draws the background grid, 3 times the size of the screen in the X and Y directions
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

    // HTML allows me to draw onto the canvas by effectively moving a pen around the screen

    let ctx = cnv.getContext('2d');

    ctx.strokeStyle = lineOptions.colour;
    ctx.lineWidth = 1;
    
    ctx.beginPath();

    let iCount = null;
    let i = null;
    let x = null;
    let y = null;

    iCount = Math.floor(iWidth / lineOptions.separation);

    // Draw vertical lines, moving from the bottom to top of the screen for each stroke
    
    for (i = 1; i <= iCount; i++) {
        x = (i * lineOptions.separation);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, iHeight);
        ctx.stroke();
    }
    
    
    // Draw horizontal lines, moving from left to right
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
