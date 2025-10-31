"""Context manager to coordinate all context updates"""
from .updaters.earthquake_updater import earthquake_context_updater
from .updaters.volcanic_advisories_updater import volcanic_advisories_context_updater
from .updaters.risk_evaluation_updater import risk_evaluation_context_updater
from .master_context_service import master_context_service


class ContextManager:
    def __init__(self):
        self.earthquake_updater = earthquake_context_updater
        self.volcanic_updater = volcanic_advisories_context_updater
        self.risk_updater = risk_evaluation_context_updater
        self.master_service = master_context_service
    
    async def update_all_contexts(self):
        """Update all dynamic contexts and recompile master"""
        try:
            print("Starting context update...")
            
            # Update all dynamic contexts
            await self.earthquake_updater.update_earthquake_context()
            await self.volcanic_updater.update_volcanic_advisories_context()
            await self.risk_updater.update_risk_evaluation_context()
            
            # Recompile master context
            self.master_service.compile_master_context()
            
            print("All contexts updated successfully!")
            return True
            
        except Exception as e:
            print(f"Error updating contexts: {e}")
            return False
    
    async def update_earthquake_context(self, hours: int = 24):
        """Update only earthquake context"""
        try:
            await self.earthquake_updater.update_earthquake_context(hours)
            self.master_service.compile_master_context()
            return True
        except Exception as e:
            print(f"Error updating earthquake context: {e}")
            return False
    
    async def update_volcanic_context(self):
        """Update only volcanic advisories context"""
        try:
            await self.volcanic_updater.update_volcanic_advisories_context()
            self.master_service.compile_master_context()
            return True
        except Exception as e:
            print(f"Error updating volcanic context: {e}")
            return False
    
    async def update_risk_context(self):
        """Update only risk evaluation context"""
        try:
            await self.risk_updater.update_risk_evaluation_context()
            self.master_service.compile_master_context()
            return True
        except Exception as e:
            print(f"Error updating risk context: {e}")
            return False
    
    def get_master_context(self) -> str:
        """Get the current master context"""
        return self.master_service.get_master_context()


# Global instance
context_manager = ContextManager()