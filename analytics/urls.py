from django.urls import path
from .views import DashboardStatsView,LiveOccupancyView,RosterDetailView,ExportFinancialsCSV,ExportRosterCSV,CityBotAIView,AnnouncementView,RevenueListView,ActivityListView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('live/', LiveOccupancyView.as_view(), name='live-stats'),
    path('roster/<str:item_type>/<int:pk>/', RosterDetailView.as_view(), name='roster-detail'),
    path('export/roster/<str:item_type>/<int:pk>/', ExportRosterCSV.as_view(), name='export-roster'),
    path('export/financials/', ExportFinancialsCSV.as_view(), name='export-financials'),
    path('chat/', CityBotAIView.as_view(), name='ai-chat'),
    path('announcement/', AnnouncementView.as_view(), name='announcement'),
    path('revenue/', RevenueListView.as_view(), name='revenue-list'),
    path('activity/', ActivityListView.as_view(), name='activity-list'),
]