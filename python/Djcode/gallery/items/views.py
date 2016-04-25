from django.views import generic
from items.models import Item, Photo
        
class IndexView(generic.ListView):
    template_name = 'items/index.html'
    def get_queryset(self):
        return Item.objects.all()[:5]
        
class ListView(generic.ListView):
    model = Item
    template_name = 'items/items_list.html'
        
class ItemDetailView(generic.DetailView):
    model = Item    
    template_name = 'items/items_detail.html'
        
class PhotoDetailView(generic.DetailView):
    model = Photo
    template_name = 'items/photos_detail.html'
