from django.conf.urls import patterns, include, url
from django.contrib import admin
from gallery import settings

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root':settings.MEDIA_ROOT}),
    url(r'^items/', include('items.urls')),
)

