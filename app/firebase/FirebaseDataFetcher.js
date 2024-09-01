"use client";
import React, {useState} from "react";
import {database} from "./firebase";
import {ref, get, update} from "firebase/database";

const FirebaseDataFetcher = () => {
  const [index, setIndex] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    image_caption: "",
    surface_message: "",
    background_knowledge: [""],
    implicit_message: [""],
    label: "",
  });

  const fetchData = async (newIndex = index) => {
    if (!newIndex) {
      setError("Please enter a valid index.");
      return;
    }

    setError("");
    setData(null);

    try {
      const dbRef = ref(database, `/${index}`);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const fetchedData = snapshot.val();
        const orderedKeys = [
          "img",
          "text",
          "image_caption",
          "surface_message",
          "background_knowledge",
          "implicit_message",
          "label",
        ];
        const filteredData = orderedKeys.reduce((acc, key) => {
          if (fetchedData[key] !== undefined) {
            acc[key] = fetchedData[key];
          }
          return acc;
        }, {});
        setData(filteredData);
        setFormData({
          image_caption: fetchedData.image_caption || "",
          surface_message: fetchedData.surface_message || "",
          background_knowledge: parseStringToArray(
            fetchedData.background_knowledge,
          ),
          implicit_message: parseImplicitMessage(fetchedData.implicit_message),
          label: fetchedData.label || "",
        });
        // setIndex(newIndex);
      } else {
        setError("No data available at this index.");
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  const parseStringToArray = (str) => {
    if (typeof str === "string") {
      return str
        .replace(/[\[\]',]/g, "")
        .split(/(?:\d+\.\s)/)
        .filter(Boolean)
        .map((item) => item.trim());
    }
    return [str];
  };

  const parseImplicitMessage = (str) => {
    if (typeof str === "string") {
      return str
        .replace(/[\[\]']/g, "")
        .split(/\s*,\s*/)
        .filter((item) => item.length >= 12)
        .map((item) => item.trim());
    }
    return [str];
  };

  const formatArrayToString = (arr) => {
    return arr
      .map((item, index) => `'${index + 1}. ${item.trim()}'`)
      .join(", ");
  };

  const formatImplicitMessageToString = (arr) => {
    return arr.map((item) => `'${item.trim()}'`).join(", ");
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    const [field, index] = name.split("-");
    if (field === "label" && value !== "0" && value !== "1") {
      setError("Label must be 0 or 1.");
      return;
    }
    if (index !== undefined) {
      const updatedArray = [...formData[field]];
      updatedArray[parseInt(index, 10)] = value;
      setFormData({
        ...formData,
        [field]: updatedArray,
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const addArrayElement = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const saveData = async () => {
    try {
      const dbRef = ref(database, `/${index}`);
      const formattedData = {
        ...formData,
        background_knowledge: `[${formatArrayToString(
          formData.background_knowledge.filter((item) => item.trim() !== ""),
        )}]`,
        implicit_message: `[${formatImplicitMessageToString(
          formData.implicit_message.filter((item) => item.trim() !== ""),
        )}]`,
      };
      await update(dbRef, formattedData);
      setError("Data updated successfully.");
    } catch (err) {
      setError("Error updating data: " + err.message);
    }
  };

  const handlePrev = () => {
    const prevIndex = parseInt(index, 10) - 1;
    if (prevIndex >= 0) {
      fetchData(prevIndex.toString());
    }
  };

  const handleNext = () => {
    const nextIndex = parseInt(index, 10) + 1;
    fetchData(nextIndex.toString());
  };

  return (
    <div>
      <input
        className="text-black"
        type="text"
        value={index}
        onChange={(e) => setIndex(e.target.value)}
        placeholder="Enter index"
      />
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={handlePrev}>Prev</button>
      <button onClick={handleNext}>Next</button>
      {error && <p style={{color: "red"}}>{error}</p>}
      {data && (
        <div>
          {data.img && (
            <div>
              <strong>img:</strong>
              <img
                src={`https://personal.utdallas.edu/~jxp220018/${data.img}`}
                alt="Fetched"
              />
            </div>
          )}
          {data.text && (
            <div>
              <strong>text:</strong> {data.text}
            </div>
          )}
          {Object.entries(data).map(
            ([key, value]) =>
              key !== "img" &&
              key !== "text" && (
                <div key={key}>
                  <strong>{key}:</strong>
                  {key === "label" ? (
                    <>
                      <span>{value}</span>
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleInputChange}
                        min="0"
                        max="1"
                      />
                    </>
                  ) : key === "background_knowledge" ? (
                    <>
                      {formData[key].map((item, idx) => (
                        <div key={`${key}-${idx}`}>
                          <label>{`${idx + 1}.`}</label>
                          <input
                            type="text"
                            name={`${key}-${idx}`}
                            value={item}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}
                      <button onClick={() => addArrayElement(key)}>
                        Add {key}
                      </button>
                    </>
                  ) : key === "implicit_message" ? (
                    <>
                      {formData[key].map((item, idx) => (
                        <div key={`${key}-${idx}`}>
                          <input
                            type="text"
                            name={`${key}-${idx}`}
                            value={item}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}
                      <button onClick={() => addArrayElement(key)}>
                        Add {key}
                      </button>
                    </>
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ),
          )}
          <button onClick={saveData}>Save</button>
        </div>
      )}
    </div>
  );
};

export default FirebaseDataFetcher;
