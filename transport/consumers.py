# transport/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MapConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # When a user opens the Map page, add them to the "live_map" broadcast group
        self.group_name = "live_map"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # When they close the tab, remove them from the group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def map_update(self, event):
        # This function catches messages sent from Django and pushes them to React
        await self.send(text_data=json.dumps(event["data"]))