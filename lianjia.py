#/usr/bin/python
#! -*-coding:utf-8-*-


import re
import sys
import lxml
import redis
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
	'jp01-30.ssv7.net:39629',
	'jp06-30.ssv7.net:39629',
	'sg02-30.ssv7.net:39629',
	'sg03-30.ssv7.net:39629',
	'sg05-30.ssv7.net:39629',
	'us01-30.ssv7.net:39629',
	'us02-30.ssv7.net:39629',
	'us03-30.ssv7.net:39629',
	'hk02-30.ssv7.net:39629'
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


def get_house_base_info(soup, area):
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


def get_house_detail(soup):
	dt_list = soup.find_all('div', 'desc-text clear')
	if not dt_list and len(dt_list) == 0:
		print 'House Detail: You do not get any shit...'
		return None

	dtlist = BS(str(dt_list[0]), 'lxml').find_all('dl')

	matched = re.search(r'>(\d+)<', str(dtlist[0]))
	total_price = matched.groups()[0] if matched else 0

	matched = re.search(r'>(\d+)', str(dtlist[1]))
	unit_price = matched.groups()[0] if matched else 0

	matched = re.search(r'>(\d+)', str(dtlist[2]))
	down_payment = matched.groups()[0] if matched else 0

	matched = re.search(r'>(\d+)', str(dtlist[3]))
	monthly_cost = matched.groups()[0] if matched else 0

	return {
		'total_price': total_price,
		'unit_price': unit_price,
		'down_payment': down_payment,
		'monthly_cost': monthly_cost
	}



def get_house_xq(soup):
	xqlist = soup.find_all('div', 'xiaoquInfoItem')
	if not xqlist and len(xqlist) == 0:
		print 'House xq: You do not get any shit...'
		return None

	matched = re.search(r'>(\d+)', str(xqlist[0]))
	build_year = matched.groups()[0] if matched else 0

	matched = re.search(r'>(\d+).(\d+)', str(xqlist[2]))
	wy_fee = float(matched.groups()[0] + '.' + matched.groups()[1]) if matched else 0

	matched = re.search(r'>(\d+)', str(xqlist[6]))
	total_building = matched.groups()[0] if matched else 0

	matched = re.search(r'>(\d+)', str(xqlist[7]))
	total_house = matched.groups()[0] if matched else 0

	matched = re.search(r'(\d+.\d+),(\d+.\d+)', str(xqlist[8]))
	lat = matched.groups()[0] if matched and len(matched.groups() > 0) else 0
	lng = matched.groups()[1] if matched and len(matched.groups() > 1) else 0

	return {
		'build_year': build_year,
		'wy_fee': wy_fee,
		'total_building': total_building,
		'total_house': total_house,
		'lat': lat,
		'lng': lng
	}



def get_fin_url(sub_area_list):
	pass


def get_base_data():
	erf_url = base_url + '/ershoufang'
	base_soup = get_html_text(erf_url)
	# area_list = get_area_list(base_soup)
	area_list = {'/ershoufang/yubei/': '\xe6\xb8\x9d\xe5\x8c\x97', '/ershoufang/changshou1/': '\xe9\x95\xbf\xe5\xaf\xbf', 
				 '/ershoufang/yongchuan/': '\xe6\xb0\xb8\xe5\xb7\x9d', '/ershoufang/jiulongpo/': '\xe4\xb9\x9d\xe9\xbe\x99\xe5\x9d\xa1', 
				 '/ershoufang/fuling/': '\xe6\xb6\xaa\xe9\x99\xb5', '/ershoufang/qijiang/': '\xe7\xb6\xa6\xe6\xb1\x9f', 
				 '/ershoufang/banan/': '\xe5\xb7\xb4\xe5\x8d\x97', '/ershoufang/nanan/': '\xe5\x8d\x97\xe5\xb2\xb8', 
				 '/ershoufang/jiangjing/': '\xe6\xb1\x9f\xe6\xb4\xa5', '/ershoufang/shapingba/': '\xe6\xb2\x99\xe5\x9d\xaa\xe5\x9d\x9d', 
				 '/ershoufang/fengdu1/': '\xe4\xb8\xb0\xe9\x83\xbd', '/ershoufang/yuzhong/': '\xe6\xb8\x9d\xe4\xb8\xad', 
				 '/ershoufang/dadukou/': '\xe5\xa4\xa7\xe6\xb8\xa1\xe5\x8f\xa3', '/ershoufang/jiangbei/': '\xe6\xb1\x9f\xe5\x8c\x97'}

	# for a in area_list:
	# 	area_list[a] = area_list[a].decode('utf-8')

	sub_area_list = list()
	for k, v in area_list.items():
		url = base_url + k
		tmp_soup = get_html_text(url)
			
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
		df.to_csv('cq_lj_base_data_1.csv', encoding = 'utf-8')


def get_base_info():
	valid_data = pd.read_csv('cq_lj_base_data.csv')
	# urls = data[data.total_page > 0]['url']
	# valid_data = base_data[base_data.total_page > 0]

	ret = list()
	for i in range(89, len(valid_data)):
		item = valid_data.ix[i]
		uri = item['url']
		
		total_page = int(item['total_page'])
		if total_page == 0:
			continue

		for j in range(total_page):
			print 'Proccessing page %s of %s' % (j+1, uri)
			page = 'pg%s' % (i+1)
			url = base_url + uri + page
			soup = get_html_text(url)
			tmp_ret = get_house_base_info(soup, url)
			ret.extend(tmp_ret)

	if len(ret) > 0:
		df = pd.DataFrame(ret)
		df.to_csv('cq_lj_base_info_02.csv')


def get_redis():
	pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
	return redis.Redis(connection_pool=pool)


if __name__ == '__main__':
	df1 = pd.read_csv('cq_lj_base_info.csv')
	df2 = pd.read_csv('cq_lj_base_info_02.csv')

	data = pd.concat([df1, df2])

	data['total_price'] = 0
	data['unit_price'] = 0
	data['down_payment'] = 0
	data['monthly_cost'] = 0
	# data['style'] = 0
	# data['total_floor'] = 0
	# data['cur_floor'] = 0
	data['lat'] = 0
	data['lng'] = 0

	xq = list()
	redis = get_redis()

	for x in xrange(0, len(data)):
		item = data.ix[x]
		print item['source_url']
		exit()
		house_detail = redis.get(item['source_url'])
		if house_detail:
			house_detail = json.loads(house_detail)
		else:
			detail_soup = get_html_text(item['source_url'])
			house_detail = get_house_detail(detail_soup)
			if not house_detail:
				redis.set(item['source_url'], json.dumps(house_detail))

		xq_detail = redis.get(item['xiaoqu_url'])
		if xq_detail:
			xq_detail = json.loads(xq_detail)
		else:
			xq_soup = get_html_text(item['xiaoqu_url'])
			xq_detail = get_house_xq(xq_soup)
			if not xq_detail:
				redis.set(item['xiaoqu_url'], json.dumps(xq_detail))
		
		if xq_detail is not None:
			xq.append(xq_detail)

		if house_detail is not None:
			data.ix[x, 'total_price'] = house_detail['house_detail']
			data.ix[x, 'unit_price'] = house_detail['unit_price']
			data.ix[x, 'down_payment'] = house_detail['down_payment']
			data.ix[x, 'monthly_cost'] = house_detail['monthly_cost']
			data.ix[x, 'total_price'] = house_detail['house_detail']
			if xq_detail is not None:
				data.ix[x, 'lat'] = xq_detail['lat']
				data.ix[x, 'lng'] = xq_detail['lng']

	data.to_csv('fin_data.csv', encoding = 'utf-8')
	
	df = pd.DataFrame(xq)
	df.to_csv('xq.csv', encoding = 'utf-8')
