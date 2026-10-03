package app_test

import (
	"mtui/app"
	"mtui/db"
	"mtui/types"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMTUIURLAcrossStartup(t *testing.T) {
	const customURL = "https://mtui.example.test/interface"
	const defaultURL = "http://mtui:8080"
	for _, tc := range []struct {
		name    string
		config  string
		wantURL string
	}{
		{"explicit", "mtui.url = " + customURL + "\n", customURL},
		{"absent", "", defaultURL},
		{"empty", "mtui.url = \n", defaultURL},
	} {
		t.Run(tc.name, func(t *testing.T) {
			worldDir := t.TempDir()
			configPath := filepath.Join(worldDir, "minetest.conf")
			require.NoError(t, os.WriteFile(configPath, []byte(tc.config+"secure.http_mods = existing\n"), 0644))

			// Seed the installed mod so startup exercises configuration without fetching it.
			t.Run("installed_mod", func(t *testing.T) {
				database, g, err := db.Init(worldDir)
				require.NoError(t, err)
				t.Cleanup(func() { require.NoError(t, database.Close()) })
				gormDatabase, err := g.DB()
				require.NoError(t, err)
				t.Cleanup(func() { require.NoError(t, gormDatabase.Close()) })
				require.NoError(t, db.Migrate(database))
				require.NoError(t, db.NewRepositories(g).ModRepo.Create(&types.Mod{
					Name: "mtui", Status: types.ModStatusInstalled,
				}))
			})

			for _, startup := range []string{"initial_start", "restart"} {
				t.Run(startup, func(t *testing.T) {
					a, err := app.Create(&types.Config{
						WorldDir: worldDir, MinetestConfig: configPath,
						DockerHostname: "mtui", APIKey: "test-api-key",
						InstallMtuiMod: true,
						EnabledFeatures: []string{
							string(types.FEATURE_DOCKER), string(types.FEATURE_MINETEST_CONFIG),
						},
					})
					require.NoError(t, err)
					t.Cleanup(func() { require.NoError(t, a.DetachDatabase()) })

					// The install endpoint invokes the same function after startup.
					_, err = a.CreateMTUIMod()
					require.NoError(t, err)
					settings, err := a.ReadMTConfig(nil)
					require.NoError(t, err)
					require.NotNil(t, settings["mtui.url"])
					require.Equal(t, tc.wantURL, settings["mtui.url"].Value)
					require.Equal(t, "test-api-key", settings["mtui.key"].Value)
					require.Equal(t, "existing,mtui", settings["secure.http_mods"].Value)
				})
			}
		})
	}
}
