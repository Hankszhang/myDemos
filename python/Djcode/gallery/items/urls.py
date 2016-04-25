from django.conf.urls import patterns, url
from items import views

urlpatterns = patterns('',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^list/$', views.ListView.as_view(), name='item_list'),
    url(r'^(?P<pk>\d+)/$', views.ItemDetailView.as_view(), name='item_detail'),
    url(r'^photo/(?P<pk>\d+)/$', views.PhotoDetailView.as_view(), name='photo_detail'),
    )

