#!/usr/local/bin/python2.7

import os

import tornado.ioloop
import tornado.web

import handler

# static/templates files
settings = {
    "static_path":os.path.join(os.path.dirname(__file__), "static"),
    "template_path":os.path.join(os.path.dirname(__file__), "templates")
}

urls = [
    (r'/goodlist', 'handler.goodlist.IndexHandler'),
    (r'/order', 'handler.order.IndexHandler'),
]

app = tornado.web.Application(urls, **settings)

try:
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
except (KeyboardInterrupt, SystemExit):
    pass
except:
    raise

