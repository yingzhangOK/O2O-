/*
Navicat MySQL Data Transfer

Source Server         : mydb
Source Server Version : 50631
Source Host           : localhost:3306
Source Database       : delicous

Target Server Type    : MYSQL
Target Server Version : 50631
File Encoding         : 65001

Date: 2016-07-07 10:19:54
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `d_admin_menu`
-- ----------------------------
DROP TABLE IF EXISTS `d_admin_menu`;
CREATE TABLE `d_admin_menu` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '菜单id',
  `parent_id` int(11) NOT NULL DEFAULT '0' COMMENT '父菜单id',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT '菜单名称',
  `url` varchar(255) NOT NULL DEFAULT '' COMMENT '菜单url',
  `sort` int(11) NOT NULL COMMENT '排序',
  `show` int(11) NOT NULL COMMENT '是否显示',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='菜单表';

-- ----------------------------
-- Records of d_admin_menu
-- ----------------------------

-- ----------------------------
-- Table structure for `d_admin_privilege`
-- ----------------------------
DROP TABLE IF EXISTS `d_admin_privilege`;
CREATE TABLE `d_admin_privilege` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pri_master` char(11) NOT NULL COMMENT '权限所属 角色或个人',
  `pri_master_v` int(11) unsigned NOT NULL COMMENT '权限所属id 用户id或角色id',
  `pri_access` char(11) NOT NULL COMMENT '访问权限 菜单（模块）或按钮',
  `pri_access_v` int(11) NOT NULL COMMENT '访问权限 菜单（模块)id或按钮id',
  `create_time` int(11) unsigned NOT NULL COMMENT '创建时间',
  `modify_time` int(11) unsigned NOT NULL COMMENT '更新时间',
  `modify_uid` int(11) unsigned NOT NULL COMMENT '更新人',
  `active` int(1) NOT NULL DEFAULT '0' COMMENT '是否激活 默认0不激活 1激活',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='权限表';

-- ----------------------------
-- Records of d_admin_privilege
-- ----------------------------

-- ----------------------------
-- Table structure for `d_admin_role`
-- ----------------------------
DROP TABLE IF EXISTS `d_admin_role`;
CREATE TABLE `d_admin_role` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL COMMENT '角色名称',
  `role_desc` varchar(20) NOT NULL COMMENT '角色描述',
  `create_time` int(11) unsigned NOT NULL COMMENT '创建时间',
  `modify_time` int(11) unsigned NOT NULL COMMENT '更新时间',
  `modify_uid` int(11) unsigned NOT NULL COMMENT '更新人',
  `active` int(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='角色表';

-- ----------------------------
-- Records of d_admin_role
-- ----------------------------

-- ----------------------------
-- Table structure for `d_admin_users`
-- ----------------------------
DROP TABLE IF EXISTS `d_admin_users`;
CREATE TABLE `d_admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'uid',
  `mobile` char(11) NOT NULL COMMENT '手机号',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '用户密码',
  `username` varchar(32) NOT NULL COMMENT '用户名称',
  `role_id` int(11) unsigned NOT NULL COMMENT '角色id',
  `active` int(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否激活 默认0不激活 1激活',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='用户表';

-- ----------------------------
-- Records of d_admin_users
-- ----------------------------

-- ----------------------------
-- Table structure for `d_deliverer`
-- ----------------------------
DROP TABLE IF EXISTS `d_deliverer`;
CREATE TABLE `d_deliverer` (
  `id` smallint(5) NOT NULL AUTO_INCREMENT,
  `region` varchar(6) NOT NULL,
  `delmobile` varchar(11) NOT NULL,
  `delname` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_deliverer
-- ----------------------------

-- ----------------------------
-- Table structure for `d_discount_coupon`
-- ----------------------------
DROP TABLE IF EXISTS `d_discount_coupon`;
CREATE TABLE `d_discount_coupon` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '优惠卷id',
  `uid` int(11) unsigned NOT NULL COMMENT '用户id',
  `money` float(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '金额',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '状态（0未使用，1已使用，2已过期）',
  `type` char(30) NOT NULL DEFAULT '' COMMENT '优惠卷类型',
  `valid_from` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '开始使用时间',
  `valid_to` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '使过期时间',
  `creation` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '添加时间',
  `use_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '使用时间',
  `use_order_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '使用的订单id',
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='优惠卷';

-- ----------------------------
-- Records of d_discount_coupon
-- ----------------------------

-- ----------------------------
-- Table structure for `d_discount_rules`
-- ----------------------------
DROP TABLE IF EXISTS `d_discount_rules`;
CREATE TABLE `d_discount_rules` (
  `id` mediumint(9) unsigned NOT NULL AUTO_INCREMENT,
  `code_formular` varchar(4) NOT NULL COMMENT '计算代码',
  `valid_to` date NOT NULL,
  `valid_from` date NOT NULL,
  `valid_region` varchar(6) NOT NULL,
  `valid_location` varchar(4) NOT NULL,
  `priority` int(3) NOT NULL,
  `stackable` tinyint(1) NOT NULL DEFAULT '0',
  `stackable_from` int(3) NOT NULL,
  `stackable_to` int(3) NOT NULL,
  `discount_reason` varchar(20) NOT NULL,
  `parameter` varchar(100) NOT NULL,
  `discount_long_desc` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `code_formular` (`code_formular`,`valid_to`),
  KEY `valid_to` (`valid_region`,`valid_to`,`valid_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Must ensure size <1M !!!!!!';

-- ----------------------------
-- Records of d_discount_rules
-- ----------------------------

-- ----------------------------
-- Table structure for `d_locations`
-- ----------------------------
DROP TABLE IF EXISTS `d_locations`;
CREATE TABLE `d_locations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `region` varchar(6) NOT NULL,
  `location` varchar(4) NOT NULL,
  `sub_location` varchar(4) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `valid_from` date NOT NULL DEFAULT '1970-01-01',
  `valid_to` date NOT NULL DEFAULT '9999-12-31',
  `short_name` varchar(6) NOT NULL,
  `name` varchar(18) NOT NULL,
  `selection_name` varchar(20) NOT NULL,
  `address` varchar(50) NOT NULL,
  `details` mediumtext NOT NULL,
  `countdown` int(1) unsigned NOT NULL DEFAULT '0',
  `del_slot_group` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `region_location` (`region`,`location`,`sub_location`),
  KEY `region_active` (`region`,`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_locations
-- ----------------------------

-- ----------------------------
-- Table structure for `d_menu_stock`
-- ----------------------------
DROP TABLE IF EXISTS `d_menu_stock`;
CREATE TABLE `d_menu_stock` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `region` varchar(6) NOT NULL,
  `location` varchar(4) NOT NULL,
  `date` date NOT NULL,
  `sku_id` int(11) unsigned NOT NULL COMMENT 'SKU ID',
  `selling_price` decimal(8,2) unsigned NOT NULL,
  `total_qty` int(8) unsigned NOT NULL,
  `ordered_qty` int(8) unsigned NOT NULL DEFAULT '0',
  `tag` varchar(32) NOT NULL DEFAULT '',
  `prod_desc` varchar(40) NOT NULL,
  `prod_detail` varchar(200) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_menu_stock
-- ----------------------------

-- ----------------------------
-- Table structure for `d_order_discount`
-- ----------------------------
DROP TABLE IF EXISTS `d_order_discount`;
CREATE TABLE `d_order_discount` (
  `id` int(10) unsigned NOT NULL,
  `discount_seq` int(4) unsigned NOT NULL,
  `item` varchar(3) NOT NULL COMMENT '''000'' means summary of discount info',
  `discount_type` mediumint(9) NOT NULL COMMENT '= discountrules.id',
  `discount_value` decimal(8,2) NOT NULL,
  `discount_reference` varchar(100) NOT NULL,
  `discount_reason` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`,`discount_seq`),
  KEY `discount_reference` (`discount_reference`,`item`),
  KEY `id_item` (`id`,`item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_order_discount
-- ----------------------------

-- ----------------------------
-- Table structure for `d_order_header`
-- ----------------------------
DROP TABLE IF EXISTS `d_order_header`;
CREATE TABLE `d_order_header` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `guid` varchar(32) NOT NULL,
  `region` varchar(6) NOT NULL,
  `location` varchar(4) NOT NULL,
  `sub_location` varchar(4) NOT NULL,
  `date` date NOT NULL,
  `timeseq` tinyint(2) unsigned NOT NULL DEFAULT '1',
  `delivery_time` time NOT NULL,
  `net_price` int(6) unsigned NOT NULL DEFAULT '0',
  `gross_price` int(6) unsigned NOT NULL DEFAULT '0',
  `customer_mobile` varchar(11) NOT NULL,
  `customer_name` varchar(20) NOT NULL,
  `customer_msg` varchar(200) NOT NULL,
  `created_by` varchar(12) NOT NULL,
  `creation_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changed_by` varchar(12) NOT NULL,
  `last_changed_timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` tinyint(2) unsigned NOT NULL COMMENT '10:未送餐;20:派送中;30:完成订单;40:客户取消订单;45:客服取消订单',
  `countdown` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guid` (`guid`),
  KEY `by_date_and_region` (`date`,`timeseq`,`region`,`status`),
  KEY `by_customer` (`customer_mobile`,`creation_timestamp`,`date`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_order_header
-- ----------------------------

-- ----------------------------
-- Table structure for `d_order_items`
-- ----------------------------
DROP TABLE IF EXISTS `d_order_items`;
CREATE TABLE `d_order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `item_price` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_ORDER_ID` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of d_order_items
-- ----------------------------

-- ----------------------------
-- Table structure for `d_parameters_v1`
-- ----------------------------
DROP TABLE IF EXISTS `d_parameters_v1`;
CREATE TABLE `d_parameters_v1` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `value_int` bigint(11) NOT NULL DEFAULT '0',
  `value_string` varchar(400) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_parameters_v1
-- ----------------------------

-- ----------------------------
-- Table structure for `d_regions`
-- ----------------------------
DROP TABLE IF EXISTS `d_regions`;
CREATE TABLE `d_regions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `city` varchar(3) NOT NULL,
  `region` varchar(6) NOT NULL,
  `avtive` tinyint(1) NOT NULL DEFAULT '1',
  `name` varchar(20) NOT NULL,
  `details` mediumtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `city_region` (`city`,`region`),
  KEY `city_active` (`city`,`avtive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_regions
-- ----------------------------

-- ----------------------------
-- Table structure for `d_sku`
-- ----------------------------
DROP TABLE IF EXISTS `d_sku`;
CREATE TABLE `d_sku` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `peicai` varchar(200) NOT NULL,
  `zhushi` varchar(200) NOT NULL,
  `sku_desc` text NOT NULL,
  `status` int(11) NOT NULL,
  `creation` int(11) NOT NULL,
  `head_pic` varchar(200) NOT NULL,
  `weight` varchar(32) NOT NULL,
  `text_pic` varchar(200) NOT NULL,
  `big_pic` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of d_sku
-- ----------------------------

-- ----------------------------
-- Table structure for `d_stock_date`
-- ----------------------------
DROP TABLE IF EXISTS `d_stock_date`;
CREATE TABLE `d_stock_date` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of d_stock_date
-- ----------------------------

-- ----------------------------
-- Table structure for `d_users`
-- ----------------------------
DROP TABLE IF EXISTS `d_users`;
CREATE TABLE `d_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(50) NOT NULL DEFAULT '',
  `creation` int(11) NOT NULL,
  `referer_mobile` varchar(11) NOT NULL DEFAULT '' COMMENT '推荐人手机号',
  `refer_count` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT '推荐次数',
  `first_order_date` date NOT NULL DEFAULT '1970-01-01',
  `last_order_date` date NOT NULL DEFAULT '1970-01-01',
  `order_count` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of d_users
-- ----------------------------
