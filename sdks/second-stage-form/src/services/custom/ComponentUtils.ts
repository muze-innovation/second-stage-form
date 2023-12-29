import { SurveyFileUploadValidatorScheme } from '../../interfaces'

export const getPreviewModalHTML = (customProperties?: SurveyFileUploadValidatorScheme) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="preview-modal" class="modal">
    <span class="close close-button">&times;</span>
    <img class="modal-content" id="image-modal">
  </div>

  <script>
    // Get the <span> element that closes the modal
    var closedButton = document.getElementsByClassName("close-button")[0]

    // When the user clicks on <span> (x), close the modal
    closedButton.onclick = function() {
      modal.style.display = "none"
    }
  </script>

  <style>
    .modal {
      display: none; 
      position: fixed; 
      z-index: 2; 
      padding-top: 100px; 
      padding-bottom: 100px;
      left: 0;
      top: 0;
      width: 100%; 
      height: 100%;
      overflow: auto; 
      background-color: rgb(0,0,0); 
      background-color: rgba(0,0,0,0.7);
    }

    .modal-content {
      margin: auto;
      display: block;
      width: 80%;
      max-width: ${customProperties?.modalMaxWidth || 700}px;
    }

    .close {
      position: absolute;
      top: 15px;
      right: 35px;
      color: #f1f1f1;
      font-size: 25px;
      font-weight: bold;
      transition: 0.3s;
    }

    .close:hover,
    .close:focus {
      color: #bbb;
      text-decoration: none;
      cursor: pointer;
    }

    @media only screen and (max-width: 700px){
      .modal-content {
        width: 100%;
      }
    }
  </style>

</body>
</html>     
    `