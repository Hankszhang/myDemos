from django.conf.urls import *
from mysite.views import hello, current_datetime, hours_ahead
from django.contrib import admin
from books import views
import debug_toolbar
admin.autodiscover()

	

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'mysite.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    (r'^admin/',include(admin.site.urls)),
    (r'^hello/$',hello),
    (r'^time/$',current_datetime),
    (r'^time/plus/(\d{1,2})/$',hours_ahead),
    #(r'^search-form/$',views.search_form),
    (r'^search/$',views.search),
    (r'^contact/$',views.contact),
    (r'^contact/thanks/$',views.thanks),
    url(r'^__debug__/', include(debug_toolbar.urls)),
)
