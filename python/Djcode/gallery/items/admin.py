from django.contrib import admin
from items.models import Item, Photo

class PhotoInline(admin.TabularInline):
    model = Photo

class ItemAdmin(admin.ModelAdmin):
    inlines = [PhotoInline]

admin.site.register(Item, ItemAdmin)    
admin.site.register(Photo)
