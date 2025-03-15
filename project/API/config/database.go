package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func ConnectDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "./informacoes-registro-login.db")
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar ao banco de dados: %v", err)
	}

	// Criar tabelas necessárias
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS usuarios (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nome TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			senha TEXT NOT NULL
		);
	`)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar tabelas: %v", err)
	}

	log.Println("Conectado ao banco de dados SQLite com sucesso!")
	return db, nil
}
