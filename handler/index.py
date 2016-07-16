#encoding=utf-8

import json
import logging
import tornado

import handler.base
import lib.util

class IndexHandler(handler.base.BaseHandler):
    def __init__(self, *args, **argkws):
	super(IndexHandler, self).__init__(*args, **argkws)
        if not self.redis or not self.redis.r_get('session'):
            self.redirect('/login')

    def get(self):
	'''
        sign = self.get_argument('signature')
	nonce = self.get_argument('nonce')
	timestamp = self.get_argument('timestamp')
	echostr = self.get_argument('echostr')
	mysign = lib.util.create_sign(nonce = nonce, timestamp = timestamp)
	self.write(echostr)
        '''
        self.redirect('/deploy')        

 
    def post(self):
	body = self.request.body
	body_str = body#.decode('utf-8')
	# Message handle method
        
        ret_msg = self.msgHandle(body_str)
        print ret_msg
        if ret_msg:
            self.set_status(200)
        else:
            self.set_status(500)
       
        self.write(ret_msg)
	self.finish()


    def msgHandle(self, xmlStr):
	msgDict = lib.util.parseXml(xmlStr)
        retMsg = None
	if msgDict and msgDict.has_key('MsgType') and msgDict['MsgType'] == 'text':
	    if msgDict.has_key('Content') and msgDict['Content'] == 'chunghwa56':
                text = 'http://wx.chunghwa56.com/login'
            else:
                text = None
            to_msg_dict = lib.util.buildMsgDict(text, msgDict['FromUserName'], 'text', msgDict['ToUserName'])
            retMsg = lib.util.toXMLStr(to_msg_dict)
        
        return retMsg



class LoginHandler(handler.base.BaseHandler):
    def __init__(self, *args, **argkws):
        super(LoginHandler, self).__init__(*args, **argkws)

    def get(self):
        self.render('login.html')


    def post(self):
        args = {k : self.get_argument(k) for k in self.request.arguments}
        if args.has_key('username') and args.has_key('password') and self.check_auth(args):
            #ret = {'errCode':0, 'errMsg':'Done'}
            self.redis.r_set('session', 'haha', 30*60)
            #self.redirect('/deploy')
            ret = {'errCode':0, 'errMsg':'Done'}
        else:
            ret = {'errCode':1, 'errMsg':'Auth failed.'}

        self.write(json.dumps(ret))
        self.finish()


    def check_auth(self, args):
        return args['username']=='chunghwa56' and args['password']=='110'
