const t=`# Backend Setup

Replace \`github.com/ORG_NAME/REPO_NAME\` with the correct location of your Go module when running \`go init\` and creating \`main.go\`.

\`\`\`bash
go mod init github.com/ORG_NAME/REPO_NAME
\`\`\`

\`\`\`go:main.go
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/ORG_NAME/REPO_NAME/backend"
	"github.com/gorilla/mux"
)

var BIND_ADDR = func() string {
	if addr := os.Getenv("BIND_ADDR"); addr != "" {
		return addr
	}
	return "127.0.0.1:8080"
}()

func main() {
	r := mux.NewRouter().StrictSlash(true)
	if _, err := backend.AddRoutes(r); err != nil {
		log.Fatalf("Failed to add routes: %v", err)
	}
	log.Printf("Starting server on %s", BIND_ADDR)
	log.Fatal(http.ListenAndServe(BIND_ADDR, r))
}
\`\`\`

\`\`\`go:backend/routes.go
package backend

import (
	"github.com/gorilla/mux"
)

const failedToEncodeResponse = \`{"status": "FAILURE", "message": "Failed to encode response.", "data": {}}\`

func AddRoutes(r *mux.Router) (*mux.Router, error) {
	r.HandleFunc("/api/v1/todo", todoHandler).Methods("GET")
	return r, nil
}
\`\`\`

\`\`\`go:backend/todo.go
package backend

import (
	"net/http"
	"time"
)

func todoHandler(w http.ResponseWriter, r *http.Request) {
	write(w, http.StatusOK,
		struct {
			Status  string      \`json:"status"\`
			Message string      \`json:"message"\`
			Data    interface{} \`json:"data"\`
		}{
			Status:  "SUCCESS",
			Message: "This is a placeholder handler.",
			Data: map[string]interface{}{
				"current_time_utc": time.Now().UTC().Format(time.RFC3339),
			},
		},
	)
}
\`\`\`

\`\`\`go:backend/utils.go
package backend

import (
	"encoding/json"
	"net/http"
)

func write(w http.ResponseWriter, status int, msg interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(msg); err != nil {
		http.Error(w, failedToEncodeResponse, http.StatusInternalServerError)
	}
}
\`\`\`

\`\`\`bash
go mod tidy
\`\`\``;export{t as default};
