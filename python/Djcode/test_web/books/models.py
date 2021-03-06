from django.db import models

# Create your models here.

class Book(models.Model):
    title = models.CharField(max_length=100)
    authors = models.CharField(max_length=20)
    publisher = models.CharField(max_length=30)
    publication_date = models.DateField()
    
    def __unicode__(self):
    	return u'%s %s' % (self.title, self.authors)

