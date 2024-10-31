
// MFCApplication7.h: MFCApplication7 응용 프로그램의 기본 헤더 파일
//
#pragma once

#ifndef __AFXWIN_H__
	#error "include 'pch.h' before including this file for PCH"
#endif

#include "resource.h"       // 주 기호입니다.


// CMFCApplication7App:
// 이 클래스의 구현에 대해서는 MFCApplication7.cpp을(를) 참조하세요.
//

class CMFCApplication7App : public CWinApp
{
public:
	CMFCApplication7App() noexcept;


// 재정의입니다.
public:
	virtual BOOL InitInstance();

// 구현입니다.
	UINT  m_nAppLook;
	afx_msg void OnAppAbout();
	DECLARE_MESSAGE_MAP()
};

extern CMFCApplication7App theApp;
