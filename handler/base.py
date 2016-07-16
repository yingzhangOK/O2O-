#!usr/bin/env python
#-*- coding:utf-8 -*-

import tornado.web

from lib.redis import PRedis


class BaseHandler(tornado.web.RequestHandler):
    def __init__(self,*argc,**argkw):
        super(BaseHandler,self).__init__(*argc,**argkw)
        
        # Common
