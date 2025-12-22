import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LogoutIcon from '../../assets/icons/logoutMenu.svg';
import ActiveLogout from '../../assets/icons/activeLogout.svg';
import TicketsIcon from '../../assets/icons/ticketsMenu.svg';
import ActiveTickets from '../../assets/icons/activeTickets.svg';
import { COLORS } from '../constants/colors';

const SideMenuNavigation = ({ items, activeItem, onSelect, onLogout, onSupport }) => {

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>

      <View>
        {items.map((item) => {
          const isActive = activeItem === item.key;
          const Icon = isActive ? item.ActiveIcon : item.Icon;

          return (
            <Pressable
              key={item.key}
              style={styles.menuRow}
              onPress={() => onSelect(item)}
            >
              {Icon && <Icon width={18} height={18} style={styles.menuIcon} />}

              <Text
                style={[
                  styles.menuText,
                  isActive && styles.menuTextActive
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* SUPPORT & LOGOUT */}
      <View style={styles.logoutWrapper}>
        {/* SUPPORT */}
        <Pressable style={styles.menuRow} onPress={onSupport}>
          {activeItem === "Support" ? (
            <ActiveTickets width={18} height={18} style={styles.menuIcon} />
          ) : (
            <TicketsIcon width={18} height={18} style={styles.menuIcon} />
          )}

          <Text
            style={[
              styles.menuText,
              activeItem === "Support" && styles.menuTextActive
            ]}
          >
            Support
          </Text>
        </Pressable>

        {/* LOGOUT */}
        <Pressable style={styles.menuRow} onPress={onLogout}>
          {activeItem === "Logout" ? (
            <ActiveLogout width={18} height={18} style={styles.menuIcon} />
          ) : (
            <LogoutIcon width={18} height={18} style={styles.menuIcon} />
          )}

          <Text
            style={[
              styles.menuText,
              activeItem === "Logout" && styles.menuTextActive
            ]}
          >
            Logout
          </Text>
        </Pressable>
        <Text style={styles.versionText}>Version 1.0.26</Text>
      </View>
    </View>
  );
};

export default SideMenuNavigation;

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 20,
    opacity: 0.8,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Manrope-Medium',
    color: COLORS.secondaryFontColor,
    opacity: 0.7,
  },
  menuTextActive: {
    opacity: 1,
    fontFamily: 'Manrope-Bold',
    color: COLORS.secondaryFontColor,
  },
  logoutWrapper: {
    paddingBottom: 70,
  },
  versionText: {
    fontSize: 12,
    color: '#89A1F3',
    marginTop: 10,
    fontFamily: 'Manrope',
  },
});
