import React, { useState } from "react";
import Papa from "papaparse";
import uploadFile_img from "./uploadFile_img.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Link, useNavigate } from "react-router-dom"; // Import useNavigate hook

library.add(fab, fas, far);

var csvFile = "none";
var name = csvFile.name;
var size = csvFile.size;
// var csvdata = "";
const UploadFile_GUI = () => {
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [csvdata, setcsvdata] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate hook

  const [uploadcsvfile, setuploadcsvfile] = useState(null);

  // const [csvFile, setCsvFile] = useState('none');

  const acceptableFile = ".csv";

  const uploadFiles = (event) => {
    console.log(event.target.files[0]);
    // setCsvFile(event.target.files[0]);

    csvFile = event.target.files[0];
    Papa.parse(csvFile, {
      // header: true,
      dynamicTyping: true, // Convert numeric and boolean strings to their proper types
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Finished:", results.data);
        setcsvdata(results.data);
      },
    });

    setuploadcsvfile(event.target.files[0]);

    name = event.target.files[0].name;
    size = event.target.files[0].size;

    setIsPreviewVisible(true);
    setIsErrorVisible(false);
  };

  const uploadToAPI = async () => {
    try {
      console.log("in try with data: ", csvdata);
      const response = await axios.post(
        `http://127.0.0.1:8000/doanalysis?csvdata=${"hi"}`,
        csvdata,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Navigate to the '/display' route
        console.log("response : ", response);
        alert("Analysis completed successfully");
        navigate("/display");
      } else {
        alert("Analysis not successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const uploadToAPI = async () => {
  //   try {
  //     console.log("in try with data: ", csvdata);
  //     const formData = new FormData();
  //     formData.append("csvdata", uploadcsvfile);
  //     const response = await axios.post(
  //       `http://127.0.0.1:8000/doanalysis`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const checkFile = (event) => {
    if (csvFile === "none" || csvFile.type !== "text/csv") {
      // File name is 'none' or not ends with '.csv'
      console.log("display error message");
      setIsErrorVisible(true);
    } else {
      // File name is not 'none' and end with '.csv'
      console.log(csvFile.name);
      console.log(csvFile.type);
      console.log("pass to api :", csvdata);
      uploadToAPI(); // API call hori hain
      setIsErrorVisible(false);
      // navigate('/display');
    }
    // window.location.href = 'new_route_url';
    // ider link add karo??
    //
  };
  const handleCancelError = () => {
    setIsErrorVisible(false); // Set isVisible back to false
  };

  const handleCancelPreview = () => {
    setIsPreviewVisible(false);
  };

  return (
    <>
      <div className="conatiner">
        <form className="form-container" enctype="multipart/form-data">
          <div className="upload-files-container">
            <div className="file-container">
              <div
                className="drag-file-area"
                onDragOver={(event) => {
                  event.preventDefault();
                  console.log("hi file :)");
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  console.log(event.dataTransfer.files[0]);

                  csvFile = event.dataTransfer.files[0];

                  Papa.parse(csvFile, {
                    header: true,
                    dynamicTyping: true, // Convert numeric and boolean strings to their proper types
                    skipEmptyLines: true,
                    complete: function (results) {
                      console.log("Finished:", results.data);
                      setcsvdata(results.data);
                    },
                  });
                  name = event.dataTransfer.files[0].name;
                  size = event.dataTransfer.files[0].size;
                  setIsPreviewVisible(true);
                }}
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-arrow-up-from-bracket"
                  size="3x"
                />
                <h3 className="dynamic-message"> Drag & drop any file here </h3>
                <label className="label">
                  or
                  <span className="browse-files">
                    <input
                      type="file"
                      className="default-file-input"
                      onChange={uploadFiles}
                      accept={acceptableFile}
                    />
                    <span className="browse-files-text"> browse file </span>
                    <span>from device</span>
                  </span>
                </label>
              </div>

              <span
                className="cannot-upload-message"
                style={{ display: isErrorVisible ? "flex" : "none" }}
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-circle-exclamation"
                  className="pr-3"
                />{" "}
                Please select a valid .CSV file
                <FontAwesomeIcon
                  icon="fa-regular fa-circle-xmark"
                  className="pl-3"
                  onClick={handleCancelError}
                />
              </span>

              <div
                className="file-block"
                style={{ display: isPreviewVisible ? "flex" : "none" }}
              >
                <div className="file-info">
                  <FontAwesomeIcon icon="fa-solid fa-file-csv" />
                  <span className="file-name pl-2 pr-2">{name} </span> |
                  <span className="file-size pl-2">
                    {(size / 1024).toFixed(2) + " KB"}{" "}
                  </span>
                </div>
                <FontAwesomeIcon
                  icon="fa-solid fa-trash"
                  onClick={handleCancelPreview}
                />
                <div className="progress-bar"> </div>
              </div>

              <button
                type="button"
                className="upload-button"
                onClick={checkFile}
              >
                Upload
              </button>
            </div>

            <div className="img-container">
              <img
                src={uploadFile_img}
                className="img-fluid"
                alt="upoload files image"
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UploadFile_GUI;
