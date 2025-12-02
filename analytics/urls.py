from django.urls import path
from .views import DashboardStatsView,LiveOccupancyView,RosterDetailView,ExportFinancialsCSV,ExportRosterCSV

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('live/', LiveOccupancyView.as_view(), name='live-stats'),
    path('roster/<str:item_type>/<int:pk>/', RosterDetailView.as_view(), name='roster-detail'),
    path('export/roster/<str:item_type>/<int:pk>/', ExportRosterCSV.as_view(), name='export-roster'),
    path('export/financials/', ExportFinancialsCSV.as_view(), name='export-financials'),
]