#! -*-coding:utf-8-*-


import re
import sys
import lxml
import random
import pandas as pd
import requests as r
from bs4 import BeautifulSoup as BS


base_url = 'http://cq.lianjia.com'

headers = {'User-Agent': r'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 'r'Chrome/45.0.2454.85 Safari/537.36 115Browser/6.0.3',
	'Referer': r'http://com.lianjia.com/',
	'Host': r'cq.lianjia.com',
	'Connection': 'keep-alive'
}


proxy_ips = [
	'218.63.98.115:8998',
	'218.207.102.107:81',
	'219.226.109.204:8998',
	'223.167.244.175:8123',
	'120.90.6.92:8080',
]


def get_html_text(url):
	try:
		proxies = {'http': 'http://' + proxy_ips[random.randint(0,len(proxy_ips)-1)]}
		# with r.Session() as s:
		resp = r.get(url, headers = headers)#, proxies = proxies)
		soup = BS(resp.text, 'lxml')
	except Exception, e:
		print '-----something wrong: %s, %s' % (sys.exc_info()[-1].tb_lineno, str(e))
		soup = None
	return soup


def get_area_list(soup):
	ul = soup.find_all('ul', class_ = 'house-lst')
	# print 'ul: %s' % ul
	ret = list()
	if not ul or len(ul) <= 0:
		print 'You do not get a shit...'
		return ret

	li_list = BS(str(ul[0]),'lxml')

	xiaoqu_list = li_list.find_all('a', class_ = 'laisuzhou')
	source_url_list = li_list.find_all('h2')

	for i in range(len(xiaoqu_list)):
		item = xiaoqu_list[i]
		xiaoqu_soup = BS(str(item), 'lxml')
		xiaoqu_url = xiaoqu_soup.a.attrs['href']
		source_soup = BS(str(source_url_list[i]), 'lxml')
		source_url = source_soup.a.attrs['href']
		d = dict(xiaoqu_url = xiaoqu_url, source_url = source_url)
		ret.append(d)
	return ret


def get_sub_area_list(soup):
	if not soup:
		return None

	ret = soup.find_all('div', 'option-list sub-option-list')

	sub_area_list = dict()
	if ret and len(ret) > 0:
		sub_filter_soup = BS(str(ret[0]), 'lxml')
		soup_sub_area_list = sub_filter_soup.select('a')
		for i in xrange(1, len(soup_sub_area_list)):
			soup_tmp  = BS(str(soup_sub_area_list[i]), 'lxml')
			k = soup_tmp.a.attrs['href']
			v = soup_tmp.select('a')[0].get_text()
			sub_area_list[k] = v

	return sub_area_list




def get_fin_url(sub_area_list):
	pass


if __name__ == '__main__':
	erf_url = base_url + '/ershoufang'
	base_soup = get_html_text(erf_url)
	# area_list = get_area_list(base_soup)
	area_list = {'/ershoufang/yubei/': u'\xe6\xb8\x9d\xe5\x8c\x97', '/ershoufang/changshou1/': u'\xe9\x95\xbf\xe5\xaf\xbf', 
				 '/ershoufang/yongchuan/': u'\xe6\xb0\xb8\xe5\xb7\x9d', '/ershoufang/jiulongpo/': u'\xe4\xb9\x9d\xe9\xbe\x99\xe5\x9d\xa1', 
				 '/ershoufang/fuling/': u'\xe6\xb6\xaa\xe9\x99\xb5', '/ershoufang/qijiang/': u'\xe7\xb6\xa6\xe6\xb1\x9f', 
				 '/ershoufang/banan/': u'\xe5\xb7\xb4\xe5\x8d\x97', '/ershoufang/nanan/': u'\xe5\x8d\x97\xe5\xb2\xb8', 
				 '/ershoufang/jiangjing/': u'\xe6\xb1\x9f\xe6\xb4\xa5', '/ershoufang/shapingba/': u'\xe6\xb2\x99\xe5\x9d\xaa\xe5\x9d\x9d', 
				 '/ershoufang/fengdu1/': u'\xe4\xb8\xb0\xe9\x83\xbd', '/ershoufang/yuzhong/': u'\xe6\xb8\x9d\xe4\xb8\xad', 
				 '/ershoufang/dadukou/': u'\xe5\xa4\xa7\xe6\xb8\xa1\xe5\x8f\xa3', '/ershoufang/jiangbei/': u'\xe6\xb1\x9f\xe5\x8c\x97'}

	sub_area_list = list()
	for k, v in area_list.items():
		url = base_url + k
		tmp_soup = get_html_text(url)
		xxoo = get_area_list(tmp_soup)
		if len(xxoo) == 0:
			continue
			
		tmp_sub_area_list = get_sub_area_list(tmp_soup)
		sub_area_list.append(tmp_sub_area_list)
	
	#print sub_area_list
	fin_list = list()
	for item in sub_area_list:
		for k, v in item.items():
			url = base_url + k
			soup = get_html_text(url)
			page_html = soup.find_all('div', class_ = 'page-box house-lst-page-box')
			# page_div = BS(str(page_html[0]), 'lxml')
			total_page = 0
			if page_html and len(page_html) > 0:
				try:
					total_page = re.search(r'totalPage\":(?P<totalPage>\d+)', str(page_html[0])).groups()[0]
				except Exception, e:
					pass

			d = dict(name = v, url = k, total_page = total_page)
			fin_list.append(d)

	if len(fin_list) > 0:
		df = pd.DataFrame(fin_list)
		df.to_csv('cq_lj_base_data.csv', encoding = 'utf-8')