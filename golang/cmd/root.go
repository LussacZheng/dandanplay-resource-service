package cmd

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/routers"
	"dandanplay-resource-service/utils"
	"dandanplay-resource-service/utils/logger"
)

var (
	isVersion bool
)

var rootCmd = &cobra.Command{
	Use:   config.Name,
	Short: config.ShortDescription,
	Long:  config.LongDescription,
	Run:   rootHandler,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	// Define global flags
	//rootCmd.PersistentFlags().BoolVarP()

	// Define local flags
	rootCmd.Flags().BoolVarP(
		&isVersion, "version", "V", false,
		fmt.Sprintf("Print the version number of %s", config.Name),
	)
	rootCmd.Flags().StringVarP(&config.Host, "host", "H", "localhost",
		`IP address the API listens on, such as "0.0.0.0", "127.0.0.1", or "192.168.0.100"`)
	rootCmd.Flags().StringVarP(&config.Port, "port", "P", "8080",
		"Listen port of the API")
	rootCmd.Flags().StringVarP(&config.Proxy, "proxy", "x", "",
		`Proxy address for web scraper, "http" and "socks5" are supported`)
}

func rootHandler(cmd *cobra.Command, args []string) {
	if isVersion {
		utils.PrintVersionInfo()
		return
	}

	gin.SetMode(gin.ReleaseMode)

	r := routers.InitRouter()

	// https://pkg.go.dev/net#Dial , https://pkg.go.dev/net#Listen
	if config.Port != "" {
		config.Port = ":" + config.Port
	}
	displayedHost := config.Host
	if config.Host == "" {
		// Only when running: dandanplay-resource-service -H '""'
		displayedHost = "0.0.0.0"
	}

	logger.Infof("{{Listening and serving HTTP on http://%s%s}}", displayedHost, config.Port)

	if err := r.Run(config.Host + config.Port); err != nil {
		logger.Errorf("{{Server start failed.}} %v\n", err)
	}
}
