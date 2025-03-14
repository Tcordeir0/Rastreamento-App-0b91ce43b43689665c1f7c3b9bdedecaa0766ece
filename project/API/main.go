package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Driver struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Vehicle   string    `json:"vehicle"`
	License   string    `json:"license"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	LastSeen  time.Time `json:"last_seen"`
}

var drivers = make(map[string]Driver)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var connections = make(map[*websocket.Conn]bool)
var connectionsMutex sync.Mutex

var driverLocations = make(map[string]Location)
var locationsMutex sync.Mutex

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timestamp int64   `json:"timestamp"`
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/ws", handleWebSocket)
	r.HandleFunc("/drivers", getDrivers).Methods("GET")
	r.HandleFunc("/drivers/{id}", getDriver).Methods("GET")
	r.HandleFunc("/drivers", createDriver).Methods("POST")
	r.HandleFunc("/drivers/{id}/location", updateDriverLocation).Methods("PUT")
	r.HandleFunc("/drivers/{id}/track", getDriverTrack).Methods("GET")

	log.Println("API rodando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erro ao atualizar para WebSocket:", err)
		return
	}
	defer conn.Close()

	connectionsMutex.Lock()
	connections[conn] = true
	connectionsMutex.Unlock()

	for {
		var location Location
		err := conn.ReadJSON(&location)
		if err != nil {
			log.Println("Erro ao ler mensagem:", err)
			break
		}

		locationsMutex.Lock()
		driverLocations[conn.RemoteAddr().String()] = location
		locationsMutex.Unlock()

		broadcastLocation(location)
	}
}

func broadcastLocation(location Location) {
	connectionsMutex.Lock()
	defer connectionsMutex.Unlock()

	for conn := range connections {
		err := conn.WriteJSON(location)
		if err != nil {
			log.Println("Erro ao enviar mensagem:", err)
			conn.Close()
			delete(connections, conn)
		}
	}
}

func getDrivers(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(drivers)
}

func getDriver(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	if driver, ok := drivers[params["id"]]; ok {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(driver)
		return
	}
	http.Error(w, "Driver not found", http.StatusNotFound)
}

func createDriver(w http.ResponseWriter, r *http.Request) {
	var driver Driver
	if err := json.NewDecoder(r.Body).Decode(&driver); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	driver.LastSeen = time.Now()
	drivers[driver.ID] = driver
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(driver)
}

func updateDriverLocation(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	driver, ok := drivers[params["id"]]
	if !ok {
		http.Error(w, "Driver not found", http.StatusNotFound)
		return
	}

	var location struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	driver.Latitude = location.Latitude
	driver.Longitude = location.Longitude
	driver.LastSeen = time.Now()
	drivers[driver.ID] = driver
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(driver)
}

func getDriverTrack(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	driverID := params["id"]

	locationsMutex.Lock()
	location, exists := driverLocations[driverID]
	locationsMutex.Unlock()

	if !exists {
		http.Error(w, "Motorista não encontrado", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(location)
}
