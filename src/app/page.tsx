"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LatLngExpression } from "leaflet" // ✅ Import this
import "leaflet/dist/leaflet.css"

interface WildlifeDetection {
  id: number
  animal_name: string
  detection_time: string
  latitude: number
  longitude: number
  image_url: string
}

export default function WildlifeDetectionDashboard() {
  const [wildlifeDetections, setWildlifeDetections] = useState<WildlifeDetection[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [center, setCenter] = useState<LatLngExpression>([9.9816, 76.2999]) // ✅ Fixed type

  const fetchDetections = (place: string) => {
    fetch(`http://13.53.134.177:5000/latest-spotting?place=${place}`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Invalid response:", data)
          return
        }
        setWildlifeDetections(data)
        if (data.length > 0) {
          setCenter([data[0].latitude, data[0].longitude]) // ✅ Always a valid LatLngExpression
        }
      })
      .catch((error) => console.error("Error fetching data:", error))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b py-4 container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wildlife Detection Dashboard</h1>
      </header>

      <main className="flex-1 container mx-auto py-6">
        {/* Search Input */}
        <div className="mb-4 flex gap-2">
          <Input
            type="text"
            placeholder="Enter a place name (e.g., Bihar)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => fetchDetections(searchQuery)}>Search</Button>
        </div>

        {/* Map Display */}
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Detection Map</CardTitle>
          </CardHeader>
          <CardContent>
            <MapContainer center={center as LatLngExpression} zoom={10} style={{ height: "450px", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {wildlifeDetections.map((detection) => (
                <Marker key={detection.id} position={[detection.latitude, detection.longitude]}>
                  <Popup>
                    <h3 className="font-medium">{detection.animal_name}</h3>
                    <p className="text-xs">{format(new Date(detection.detection_time), "PPp")}</p>
                    <img src={detection.image_url} alt={detection.animal_name} className="w-32 h-20 mt-2 rounded-md" />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
