import json
from pathlib import Path
from typing import Dict, Any

class ConfigManager:
    def __init__(self, config_path: str = "config/config.json"):
        """Initialize the configuration manager with the path to the config file."""
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self._create_directories()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found at {self.config_path}")
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in configuration file: {self.config_path}")

    def _create_directories(self) -> None:
        """Create necessary directories specified in the config."""
        # Create recording directory
        rec_dir = Path(self.config['recording']['save_directory'])
        rec_dir.mkdir(parents=True, exist_ok=True)
        
        # Create output directories
        for output_format in self.config['output']['formats']:
            out_dir = Path(output_format['save_directory'])
            out_dir.mkdir(parents=True, exist_ok=True)

    def get(self, *keys) -> Any:
        """Get a nested config value using dot notation."""
        value = self.config
        for key in keys:
            value = value.get(key, {})
        return value if value != {} else None

    def update(self, updates: Dict[str, Any]) -> None:
        """Update configuration with new values."""
        def update_nested(d, u):
            for k, v in u.items():
                if isinstance(v, dict):
                    d[k] = update_nested(d.get(k, {}), v)
                else:
                    d[k] = v
            return d
        
        self.config = update_nested(self.config, updates)
        self._save_config()

    def _save_config(self) -> None:
        """Save the current configuration to file."""
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)

# Global config instance
config = ConfigManager()
