"use client";

import { useState } from "react";
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
  [key: string]: string | string[];
}

export function DataFetchForm() {
  const [index, setIndex] = useState("");
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    image_caption: "",
    surface_message: "",
    background_knowledge: [""],
    implicit_message: [""],
    label: "",
  });
  const [isSaved, setIsSaved] = useState(false);

  const fetchData = async (newIndex: string) => {
    setIndex(newIndex);
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
        const orderedKeys = [
          "img",
          "text",
          "image_caption",
          "surface_message",
          "background_knowledge",
          "implicit_message",
          "label",
        ];
        const filteredData: Record<string, any> = orderedKeys.reduce(
          (acc: Record<string, any>, key: string) => {
            if (fetchedData[key] !== undefined) {
              acc[key] = fetchedData[key];
            }
            return acc;
          },
          {}
        );
        setData(filteredData);
        setFormData({
          image_caption: fetchedData.image_caption || "",
          surface_message: fetchedData.surface_message || "",
          background_knowledge: Array.isArray(fetchedData.background_knowledge)
            ? fetchedData.background_knowledge
            : [""],
          implicit_message: Array.isArray(fetchedData.implicit_message)
            ? fetchedData.implicit_message
            : [""],
          label: fetchedData.label || "",
        });
        setIsSaved(false);
      } else {
        setError("No data available at this index.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error fetching data: " + err.message);
      } else {
        setError("Error fetching data: An unknown error occurred");
      }
    }
  };

  interface EventTargetWithName extends EventTarget {
    name: string;
    value: string;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target as EventTargetWithName;
    const [field, index] = name.split("-");
    setIsSaved(false);
    if (index !== undefined) {
      const updatedArray = [...(formData[field] as string[])];
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

  const handlePrev = () => {
    const decrementedIndex = parseInt(index, 10) - 1;
    let stringIndex = decrementedIndex.toString();
    setIndex(stringIndex);
    if (decrementedIndex >= 0) {
      fetchData(decrementedIndex.toString());
    }
  };

  const handleNext = () => {
    let incrementedIndex = parseInt(index, 10) + 1;
    let stringIndex = incrementedIndex.toString();
    setIndex(stringIndex);
    fetchData(stringIndex);
  };

  const addArrayElement = (field: keyof FormData): void => {
    if (Array.isArray(formData[field])) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] as string[]), ""],
      });
    }
  };

  const saveData = async () => {
    if (formData.label !== "0" && formData.label !== "1") {
      setError("Label must be 0 or 1.");
      return;
    }

    // 빈 문자열을 제거하는 로직 추가
    const cleanedFormData = {
      ...formData,
      background_knowledge: formData.background_knowledge.filter(
        (item) => item.trim() !== ""
      ),
      implicit_message: formData.implicit_message.filter(
        (item) => item.trim() !== ""
      ),
    };

    try {
      const dbRef = ref(database, `/${index}`);
      await update(dbRef, cleanedFormData);
      setError("Data updated successfully.");
      setIsSaved(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error updating data: " + err.message);
      } else {
        setError("Error updating data: An unknown error occurred");
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Hateful Meme Detector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {data && (
            <Button
              onClick={handlePrev}
              variant="outline"
              size="icon"
              disabled={parseInt(index) <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
          )}
          <div className="flex space-x-4 w-full">
            <div className="flex-grow">
              <Label htmlFor="index">Index</Label>
              <Input
                id="index"
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                placeholder="Enter index"
              />
            </div>
            <Button onClick={() => fetchData(index)} className="mt-auto">
              Fetch data
            </Button>
          </div>
          {data && (
            <Button onClick={handleNext} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          )}
        </div>
        {data && (
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <img
                src={`https://personal.utdallas.edu/~jxp220018/${data.img}`}
                alt="Fetched"
                className="mt-2 border rounded"
              />
            </div>
            <div>
              <Label htmlFor="text">Text</Label>
              <Textarea id="text" value={data.text} readOnly className="mt-1" />
            </div>
            {Object.entries(data).map(
              ([key, value]) =>
                key !== "img" &&
                key !== "text" && (
                  <div key={key}>
                    <Label>{key}:</Label>
                    {key === "label" ? (
                      <Input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleInputChange}
                        min="0"
                        max="1"
                      />
                    ) : key === "background_knowledge" ? (
                      <>
                        {Array.isArray(formData[key]) &&
                          formData[key].map((item, idx) => (
                            <div key={`${key}-${idx}`}>
                              <Label>{`Background Knowledge ${idx + 1}`}</Label>
                              <Input
                                className="mt-1"
                                type="text"
                                name={`${key}-${idx}`}
                                value={item}
                                onChange={handleInputChange}
                              />
                            </div>
                          ))}
                        <Button
                          className="mt-2"
                          variant="outline"
                          onClick={() => addArrayElement(key)}
                        >
                          Add {key}
                        </Button>
                      </>
                    ) : key === "implicit_message" ? (
                      <>
                        {Array.isArray(formData[key]) &&
                          formData[key].map((item, idx) => (
                            <div key={`${key}-${idx}`}>
                              <Input
                                className="mt-2"
                                type="text"
                                name={`${key}-${idx}`}
                                value={item}
                                onChange={handleInputChange}
                              />
                            </div>
                          ))}
                        <Button
                          className="mt-2"
                          variant="outline"
                          onClick={() => addArrayElement(key)}
                        >
                          Add {key}
                        </Button>
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
            )}
            <Button
              onClick={saveData}
              className="w-full"
              disabled={!data || isSaved}
            >
              {isSaved ? "Saved" : "Save"}
            </Button>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
