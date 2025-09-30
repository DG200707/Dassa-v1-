const upload = document.getElementById('upload');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const output = document.getElementById('output');
    const downloadAllBtn = document.getElementById('downloadAll');

    let imagePieces = []; // To store base64 image data

    upload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1280, 720);
        output.innerHTML = '';
        imagePieces = [];

        const pieceWidth = 1280 / 3;
        const pieceHeight = 720 / 2;

        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            const pieceCtx = pieceCanvas.getContext('2d');

            pieceCtx.drawImage(
              canvas,
              col * pieceWidth,
              row * pieceHeight,
              pieceWidth,
              pieceHeight,
              0,
              0,
              pieceWidth,
              pieceHeight
            );

            const imageData = pieceCanvas.toDataURL('image/png');
            imagePieces.push({
              name: `piece_${row + 1}_${col + 1}.png`,
              data: imageData
            });

            const imgElement = new Image();
            imgElement.src = imageData;

            const link = document.createElement('a');
            link.href = imageData;
            link.download = `piece_${row + 1}_${col + 1}.png`;
            link.appendChild(imgElement);

            output.appendChild(link);
          }
        }

        downloadAllBtn.style.display = 'inline-block';
      };

      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    downloadAllBtn.addEventListener('click', () => {
      if (imagePieces.length === 0) return;

      const zip = new JSZip();
      const folder = zip.folder("thumbnail_pieces");

      imagePieces.forEach(piece => {
        const base64Data = piece.data.split(',')[1]; // remove "data:image/png;base64,"
        folder.file(piece.name, base64Data, { base64: true });
      });

      zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "thumbnail_pieces.zip";
        link.click();
      });
    });
