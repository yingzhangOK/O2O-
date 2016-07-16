#encoding=utf-8

import tornado

from handler.base import BaseHandler

class IndexHandler(BaseHandler):
    def __init__(self, *args, **argkws):
    	super(IndexHandler, self).__init__(*args, **argkws)
        


    def get(self):
    	self.render('goodList.html')


    def post(self):
    	pass
