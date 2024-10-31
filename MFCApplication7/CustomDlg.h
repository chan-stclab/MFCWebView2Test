#pragma once


// CustomDlg 대화 상자

class CustomDlg : public CDialogEx
{
private:
	CWnd* m_pParent;

	DECLARE_DYNAMIC(CustomDlg)

public:
	CustomDlg(CWnd* pParent = nullptr);   // 표준 생성자입니다.
	virtual ~CustomDlg();

// 대화 상자 데이터입니다.
#ifdef AFX_DESIGN_TIME
	enum { IDD = IDD_DIALOG1 };
#endif

protected:
	virtual void DoDataExchange(CDataExchange* pDX);
	// DDX/DDV 지원입니다.
	virtual void InitializeWebView();

	void OnBnClickedButton1();

	DECLARE_MESSAGE_MAP()
public:
	virtual BOOL OnInitDialog();
};
