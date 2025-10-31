"""Master context compiler service for chatbot"""
import json
import os
from pathlib import Path


class MasterContextService:
    def __init__(self):
        self.context_dir = Path(__file__).parent / "context"
        self.master_file = self.context_dir / "master.txt"
    
    def _read_context_file(self, filename: str) -> str:
        """Read content from a context file"""
        try:
            file_path = self.context_dir / filename
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read().strip()
            return ""
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            return ""
    
    def compile_master_context(self) -> str:
        """Compile all context files into master context"""
        try:
            # Static context
            identity = self._read_context_file("identity.txt")
            rules = self._read_context_file("rules.txt")
            information = self._read_context_file("information.txt")
            
            # Dynamic context
            earthquakes = self._read_context_file("earthquakes.txt")
            volcanic_advisories = self._read_context_file("volcanic_advisories.txt")
            risk_evaluation = self._read_context_file("risk_evaluation.txt")
            alert = self._read_context_file("alert.txt")
            
            # Compile master context
            master_context = f"""YOU ARE:
{identity}

RULES:
{rules}

INFORMATION:
{information}

CONTEXT:
{{
    Earthquakes: {earthquakes}
    
    Volcanic Advisories: {volcanic_advisories}
    
    Risk Evaluations: {risk_evaluation}
    
    Alerts: {alert}
}}

USER INFO:
- Name: [Will be provided in conversation]
- Location: [Will be provided in conversation]
"""
            
            # Write to master.txt
            with open(self.master_file, 'w', encoding='utf-8') as f:
                f.write(master_context)
            
            return master_context
            
        except Exception as e:
            print(f"Error compiling master context: {e}")
            return "Error loading context"
    
    def get_master_context(self) -> str:
        """Get the current master context"""
        try:
            if self.master_file.exists():
                with open(self.master_file, 'r', encoding='utf-8') as f:
                    return f.read()
            else:
                # If master.txt doesn't exist, compile it
                return self.compile_master_context()
        except Exception as e:
            print(f"Error getting master context: {e}")
            return "Error loading context"


# Global instance
master_context_service = MasterContextService()