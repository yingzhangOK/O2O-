#! -*-coding:utf-8-*-

import os
import sys
import requests as request
from bs4 import BeautifulSoup as BS
from multiprocessing import Pool
import re
import lxml
import datetime
import copy
import pandas as pd


starttime = datetime.datetime.now()
base_url = r'http://cq.fangjia.com/ershoufang/'
search_list = [] 
tmp_list = [] 
layer = -1



def get_page(url):
    headers = {
        'User-Agent': r'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) '
                      r'Chrome/45.0.2454.85 Safari/537.36 115Browser/6.0.3',
        'Referer': r'http://com.fangjia.com/ershoufang/',
        'Host': r'cq.fangjia.com',
        'Connection': 'keep-alive'
    }

    response = request.get(url, headers=headers)
    return response.text


def get_search(page, key):
    soup = BS(page, 'lxml')
    search_list = soup.find_all(href=re.compile(key), target='')
    search_dict = {}
    for i in range(len(search_list)):
        soup = BS(str(search_list[i]), 'lxml')
        key = soup.select('a')[0].get_text()
        value = soup.a.attrs['href']
        search_dict[key] = value
    return search_dict


def get_info_list(search_dict, layer, tmp_list, search_list):
	layer += 1  
	for i in range(len(search_dict)):
		tmp_key = list(search_dict.keys())[i]  # 提取当前字典层级key
		tmp_list.append(tmp_key)   # 将当前key值作为索引添加至tmp_list
		tmp_value = search_dict[tmp_key]
		if isinstance(tmp_value, str):   # 当键值为url时
			tmp_list.append(tmp_value)   # 将url添加至tmp_list
			search_list.append(copy.deepcopy(tmp_list))   # 将tmp_list索引url添加至search_list
			tmp_list = tmp_list[:layer]  # 根据层级保留索引
		elif tmp_value == '':   # 键值为空时跳过
			layer -= 2           # 跳出键值层级
			tmp_list = tmp_list[:layer]   # 根据层级保留索引
		else:
			get_info_list(tmp_value, layer, tmp_list, search_list)  # 当键值为列表时，迭代遍历
			tmp_list = tmp_list[:layer]

	return search_list


def get_info_pn_list(search_list):
	fin_search_list = list()
	length = len(search_list)
	print 'length of search_list: %s' % length
	for i in range(length):
		print 'proccessing outer loop %s' % i
		search_url = search_list[i][2]
		try:
			page = get_page(search_url)
		except:
			print 'timeout'
			continue
		soup = BS(page, 'lxml')

		pn = 0
		while 1:
			pn += 1
			print 'proccessing inner loop %s, %s' % (i, pn)
			pn_rule = re.compile('[|]')
			fin_url = pn_rule.sub(r'|e-%s|' % pn, search_url, 1)
			if pn >= 100:
				print search_url
				break
			if is_end(fin_url):
				print '=============WTF============='
				break
			tmp_url_list = copy.deepcopy(search_list[i][:2])
			tmp_url_list.append(fin_url)
			fin_search_list.append(tmp_url_list)
	
	return fin_search_list


def is_end(url):
	resp = request.get(url)
	soup = BS(resp.text, 'lxml')
	house_order = soup.select('ul[class="house_order"]')
	return len(house_order) == 0



def get_info(fin_search_list, process_i):
	print('proccess %s start...' % process_i)
	fin_info_list = []
	for i in range(len(fin_search_list)):
		url = fin_search_list[i][2]
		try:
			page = get_page(url)
		except:
			print('Get tag timeout')
			continue
		soup = BS(page, 'lxml')
		title_list = soup.select('a[class="h_name"]')
		address_list = soup.select('span[class="address]')
		attr_list = soup.select('span[class="attribute"]')
		price_list = soup.find_all(attrs={"class": "xq_aprice xq_esf_width"})  # select对于某些属性值（属性值中间包含空格）无法识别，可以用find_all(attrs={})代替
		for num in range(len(title_list)):
			tag_tmp_list = []
			try:
				title = title_list[num].attrs["title"]
				address = re.sub('\n', '', address_list[num].get_text())
				area = re.search(ur'(\d+)平米', attr_list[num].get_text()).group(0)
				layout = re.search('\d[^0-9]\d.', attr_list[num].get_text()).group(0)
				floor = re.search('\d/\d', attr_list[num].get_text()).group(0) # need to fix
				price = re.search('\d+[\u4E00-\u9FA5]', price_list[num].get_text()).group(0)
				unit_price = 20000#re.search('\d[^0-9]/m.', price_list[num].get_text()).group(0)
				tag_tmp_list = copy.deepcopy(fin_search_list[i][:2])
				for tag in [title, address, area, layout, floor, price, unit_price]:
					tag_tmp_list.append(tag)
				fin_info_list.append(tag_tmp_list)
			except:
				print 'failed to scrapy %s' % sys.exc_info()[-1].tb_lineno
				continue
	print('proccess %s end' % process_i)
	return fin_info_list


#
def assignment_search_list(fin_search_list, project_num):  # project_num每个进程包含的任务数，数值越小，进程数越多
    assignment_list = []
    fin_search_list_len = len(fin_search_list)
    for i in range(0, fin_search_list_len, project_num):
        start = i
        end = i+project_num
        assignment_list.append(fin_search_list[start: end])  # 获取列表碎片
    return assignment_list



# save result as csv file
def save_excel(fin_info_list, file_name):
	tag_name = ['district', 'region', 'title', 'location', 'square_meter', 'style', 'floor', 'total_price', 'unit_price']
	df = pd.DataFrame(fin_info_list, columns = tag_name)
	df.to_csv('%s.csv' % file_name, encoding='utf-8')


if __name__ == '__main__':
	file_name = 'xxx_new'
	fin_save_list = []  # 抓取信息存储列表

	page = get_page(base_url)
	search_dict = get_search(page, 'r-')

	# 二级筛选
	for k in search_dict:
		url = search_dict[k]
		second_page = get_page(url)
		second_search_dict = get_search(second_page, 'b-')
		search_dict[k] = second_search_dict
		# 三级筛选

	# for k in search_dict:
	# 	second_dict = search_dict[k]
	# 	for s_k in second_dict:
	# 		url = second_dict[s_k]
	# 		third_page = get_page(url)
	# 		third_search_dict = get_search(third_page, 'w-')

	# 		second_dict[s_k] = third_search_dict
	
	# something wrong here
	
	fin_info_list = get_info_list(search_dict, layer, tmp_list, search_list)
	# cl = ['district', 'location', 'url']
	# data = pd.DataFrame(fin_info_list, columns = cl)
	# data.to_csv('tmp.csv', encoding = 'utf-8')
	# exit()
	fin_info_pn_list = get_info_pn_list(fin_info_list)
	# print fin_info_pn_list
	# exit()
	p = Pool(4)  # 设置进程池
	assignment_list = assignment_search_list(fin_info_pn_list, 2)  # 分配任务，用于多进
	result = []  # 多进程结果列表
	for i in range(len(assignment_list)):
		result.append(p.apply_async(get_info, args=(assignment_list[i], i)))
	p.close()
	p.join()
	for result_i in range(len(result)):
		fin_info_result_list = result[result_i].get()
		fin_save_list.extend(fin_info_result_list)  # 将各个进程获得的列表合并
	# print 'list len: %s' % len(fin_save_list)
	save_excel(fin_save_list, file_name)
	endtime = datetime.datetime.now()
	time = (endtime - starttime).seconds
	print('Total used time: %s s' % time)
