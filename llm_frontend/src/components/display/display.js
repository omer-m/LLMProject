import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import uploadFile_img from "../uploadFile/uploadFile_img.jpg";
import axios from "axios";

import { Link, useNavigate } from "react-router-dom"; // Import useNavigate hook

const Display = () => {
  const [data, setData] = useState({ name: [], analysis: "", plot: [], plotbase64: [] });
  const [selectedNameIndex, setSelectedNameIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/display")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleNameChange = (index) => {
    setSelectedNameIndex(index);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="display-container" style={{ textAlign: "left" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Following are the Recommended visualization techniques
        </h1>
        <ul>
          {data.name.map((name, index) => (
            <h4 key={name} style={{ marginBottom: "10px" }}>
              <input
                type="radio"
                id={`name_${index}`}
                name="name"
                value={name}
                checked={selectedNameIndex === index}
                onChange={() => handleNameChange(index)}
              />
              <label htmlFor={`name_${index}`} style={{ marginLeft: "10px" }}>
                {name}
              </label>
            </h4>
          ))}
        </ul>

        <h3 style={{ marginTop: "20px" }}>
          <strong>Analysis:</strong> {data.analysis}
        </h3>pipreqs ./
        <ul>
          {data.plot.map((plot, index) => (
            <li key={index}>Plot {index}: {plot}</li>
          ))}
        </ul>

        <ul>
          {data.plotbase64.map((plotbase64, index) => (
            <li key={index}>
              <img src={`data:image/png;base64, ${plotbase64}`} alt={`Plot ${index}`} />
            </li>
          ))}
        </ul>

        <button type="button" className="upload-button" onClick={() => navigate("/some-route")}>
          Display Plots
        </button>
      </div>
    </div>
  );
};

Display.propTypes = {};

Display.defaultProps = {};

export default Display;
