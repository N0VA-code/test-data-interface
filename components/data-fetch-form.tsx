"use client";

import { useState, useEffect } from "react";
import { database } from "@/app/firebase/firebase";
import { ref, get, update } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormData {
  image_caption: string;
  surface_message: string;
  background_knowledge: string[];
  implicit_message: string[];
  label: string;
}

const DataFetchForm = () => {
  const [index, setIndex] = useState("");
  const [data, setData] = useState<FormData | null>(null);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    image_caption: "",
    surface_message: "",
    background_knowledge: [""],
    implicit_message: [""],
    label: ""
  });

  useEffect(() => {
    // 클라이언트 측에서만 실행되는 코드
    if (typeof window !== "undefined") {
      // window 객체를 참조하는 코드
    }
  }, []);

  const fetchData = async (newIndex = index) => {
    if (!newIndex) {
      setError("Please enter a valid index.");
      return;
    }

    setError("");
    setData(null);

    try {
      const dbRef = ref(database, `/${newIndex}`);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const fetchedData = snapshot.val();
        const orderedKeys = ["img", "text", "image_caption", "surface_message", "background_knowledge", "implicit_message", "label"];
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
          background_knowledge: parseStringToArray(fetchedData.background_knowledge),
          implicit_message: parseImplicitMessage(fetchedData.implicit_message),
          label: fetchedData.label || ""
        });
        setIndex(newIndex);
      } else {
        setError("No data available at this index.");
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  const parseStringToArray = (str: string) => {
    if (typeof str === "string") {
      return str.replace(/[\[\]',]/g, '').split(/(?:\d+\.\s)/).filter(Boolean).map(item => item.trim());
    }
    return [str];
  };

  const parseImplicitMessage = (str: string) => {
    if (typeof str === "string") {
      return str.replace(/[\[\]']/g, '').split(/\s*,\s*/).filter(item => item.length >= 12).map(item => item.trim());
    }
    return [str];
  };

  const formatArrayToString = (arr: string[]) => {
    return arr.map((item, index) => `'${index + 1}. ${item.trim()}'`).join(', ');
  };

  const formatImplicitMessageToString = (arr: string[]) => {
    return arr.map(item => `'${item.trim()}'`).join(', ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [field, index] = name.split("-");
    if (field === "label" && (value !== "0" && value !== "1")) {
      setError("Label must be 0 or 1.");
      return;
    }
    if (index !== undefined) {
      const updatedArray = [...formData[field]];
      updatedArray[parseInt(index, 10)] = value;
      setFormData({
        ...formData,
        [field]: updatedArray
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const addArrayElement = (field: string) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""]
    });
  };

  const saveData = async () => {
    if (formData.label !== "0" && formData.label !== "1") {
      setError("Label must be 0 or 1.");
      return;
    }
    try {
      const dbRef = ref(database, `/${index}`);
      const formattedData = {
        ...formData,
        background_knowledge: `[${formatArrayToString(
          formData.background_knowledge.filter(
            (item: string) => item.trim() !== "",
          ),
        )}]`,
        implicit_message: `[${formatImplicitMessageToString(
          formData.implicit_message.filter(
            (item: string) => item.trim() !== "",
          ),
        )}]`,
      };
      await update(dbRef, formattedData);
      setError("Data updated successfully.");
      setIsSaved(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error updating data: " + err.message);
      }
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
      <Input
        type="text"
        value={index}
        onChange={(e) => setIndex(e.target.value)}
        placeholder="Enter index"
      />
      <Button onClick={fetchData}>Fetch Data</Button>
      <Button onClick={handlePrev}>Prev</Button>
      <Button onClick={handleNext}>Next</Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent>
            {data.img && (
              <div>
                <strong>img:</strong>
                <img src={`https://personal.utdallas.edu/~jxp220018/${data.img}`} alt="Fetched" />
              </div>
            )}
            {data.text && (
              <div>
                <strong>text:</strong> {data.text}
              </div>
            )}
            {Object.entries(data).map(([key, value]) => (
              key !== "img" && key !== "text" && (
                <div key={key}>
                  <strong>{key}:</strong>
                  {key === "label" ? (
                    <>
                      <span>{value}</span>
                      <Input
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
                          <Label>{`${idx + 1}.`}</Label>
                          <Input
                            type="text"
                            name={`${key}-${idx}`}
                            value={item}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}
                      <Button onClick={() => addArrayElement(key)}>Add {key}</Button>
                    </>
                  ) : key === "implicit_message" ? (
                    <>
                      {formData[key].map((item, idx) => (
                        <div key={`${key}-${idx}`}>
                          <Input
                            type="text"
                            name={`${key}-${idx}`}
                            value={item}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}
                      <Button onClick={() => addArrayElement(key)}>Add {key}</Button>
                    </>
                  ) : (
                    <Input
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              )
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={saveData}>Save</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DataFetchForm;