// this is used to initialise the database connection
package database

import (
	"history/common"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitialiseDB(connString string) (*gorm.DB, error) {
	// Load environment variables

	dsn := connString

	if dsn == "" {
		log.Fatal("PG_CONN_STRING not set in environment variables")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		//PrepareStmt:    false,
		TranslateError: true,
	})

	err = db.AutoMigrate(&common.Record{})

	if err != nil {
		log.Fatal("Error migrating database: " + err.Error())
		return nil, err
	}

	if err != nil {
		panic("GORM failed to connect to database: " + err.Error())
	}

	return db, nil
}
