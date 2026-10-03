package types

import (
	"reflect"
	"testing"
)

func TestMinetestCommand(t *testing.T) {
	want := []string{
		"--world", "/world",
		"--config", "/minetest.conf",
		"--info",
		"--logfile", "/logs/luanti.log",
	}
	cfg := Config{DockerMinetestLogLevel: "info", DockerMinetestLogfile: "/logs/luanti.log"}
	if got := cfg.MinetestCommand(); !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected command: %v", got)
	}
}

func TestMinetestCommandDefaultsLogfileToWorld(t *testing.T) {
	want := []string{
		"--world", "/world",
		"--config", "/minetest.conf",
		"--logfile", "/world/debug.txt",
	}
	cfg := Config{DockerMinetestLogLevel: "action"}
	if got := cfg.MinetestCommand(); !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected command: %v", got)
	}
}

func TestServiceLogCollectionRequiresOptIn(t *testing.T) {
	t.Setenv("COLLECT_SERVICE_LOGS", "")
	if NewConfig(t.TempDir()).CollectServiceLogs {
		t.Fatal("service log collection should be disabled by default")
	}
	t.Setenv("COLLECT_SERVICE_LOGS", "true")
	if !NewConfig(t.TempDir()).CollectServiceLogs {
		t.Fatal("explicit opt-in should enable service log collection")
	}
}

func TestEngineLogConfig(t *testing.T) {
	got := (&Config{}).EngineLogConfig()
	if got.Type != "local" || got.Config["mode"] != "non-blocking" ||
		got.Config["max-buffer-size"] != "4m" || got.Config["max-size"] != "10m" ||
		got.Config["max-file"] != "3" {
		t.Fatalf("unexpected engine logging policy: %+v", got)
	}
}
